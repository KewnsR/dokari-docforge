<?php
// php-backend/index.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");
header("X-Powered-By: Dokari");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config/database.php';
require_once 'models/Project.php';
require_once 'models/Document.php';
require_once 'models/User.php';

// Run DB migration for user tiers if columns don't exist
try {
    $db = new Database();
    $conn = $db->getConnection();
    if ($conn && method_exists($conn, 'exec')) {
        $conn->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS tier VARCHAR(20) DEFAULT 'free';");
        $conn->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;");
    }
} catch (Exception $e) {
    // Ignore migration exception
}

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/index.php', '', $path);
$path = rtrim($path, '/');

// Helper to extract authorized user ID from headers
function getAuthorizedUserId() {
    $headers = [];
    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
    }
    if (isset($headers['Authorization'])) {
        return (int) trim($headers['Authorization']);
    }
    if (isset($headers['authorization'])) {
        return (int) trim($headers['authorization']);
    }
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        return (int) trim($_SERVER['HTTP_AUTHORIZATION']);
    }
    if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        return (int) trim($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
    }
    return null;
}

// Router logic using regex path matching
if ($path === '' || $path === '/' || $path === '/api') {
    echo json_encode([
        'status' => 'online',
        'service' => 'Dokari PHP Backend API',
        'version' => '1.0.0',
        'message' => 'Dokari API endpoints are active.'
    ]);
} elseif ($path === '/api/health') {
    echo json_encode(['status' => 'healthy', 'service' => 'Dokari API']);
} elseif ($path === '/api/auth/signup') {
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $userModel = new User();
        $res = $userModel->register($data['username'] ?? '', $data['password'] ?? '');
        if (isset($res['error'])) {
            http_response_code(400);
        }
        echo json_encode($res);
    }
} elseif ($path === '/api/auth/login') {
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $userModel = new User();
        $res = $userModel->login($data['username'] ?? '', $data['password'] ?? '');
        if (isset($res['error'])) {
            http_response_code(401);
        }
        echo json_encode($res);
    }
} else {
    // Protected Endpoints
    $userId = getAuthorizedUserId();
    if (!$userId) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized. Please login first.']);
        exit;
    }
    
    if ($path === '/api/auth/profile') {
        if ($method === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            $userModel = new User();
            if (isset($data['action']) && $data['action'] === 'upgrade') {
                $res = $userModel->upgradeTier($userId, 'premium');
            } else {
                $res = $userModel->updateProfile($userId, $data['password'] ?? '');
            }
            if (isset($res['error'])) {
                http_response_code(400);
            }
            echo json_encode($res);
        } elseif ($method === 'GET') {
            $userModel = new User();
            $profile = $userModel->getProfile($userId);
            if (!$profile) {
                http_response_code(404);
                echo json_encode(['error' => 'Profile not found']);
            } else {
                echo json_encode($profile);
            }
        }
    } elseif ($path === '/api/auth/profile/usage') {
        if ($method === 'POST') {
            $userModel = new User();
            $res = $userModel->incrementUsage($userId);
            if (isset($res['error'])) {
                http_response_code(400);
            }
            echo json_encode($res);
        }
    } elseif ($path === '/api/projects') {
        if ($method === 'GET') {
            $projectModel = new Project();
            echo json_encode($projectModel->getAll($userId));
        } elseif ($method === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            $projectModel = new Project();
            $res = $projectModel->create($data, $userId);
            if (isset($res['error'])) {
                http_response_code(500);
            }
            echo json_encode($res);
        }
    } elseif (preg_match('#^/api/projects/([0-9]+)$#', $path, $matches)) {
        $projectId = $matches[1];
        $projectModel = new Project();
        if ($method === 'GET') {
            $project = $projectModel->getById($projectId, $userId);
            if (!$project) {
                http_response_code(404);
                echo json_encode(['error' => 'Project not found']);
            } else {
                echo json_encode($project);
            }
        } elseif ($method === 'DELETE') {
            echo json_encode($projectModel->delete($projectId, $userId));
        }
    } elseif (preg_match('#^/api/projects/([0-9]+)/files$#', $path, $matches)) {
        $projectId = $matches[1];
        if ($method === 'GET') {
            $projectModel = new Project();
            $project = $projectModel->getById($projectId, $userId);
            if (!$project) {
                http_response_code(403);
                echo json_encode(['error' => 'Access denied to this project']);
                exit;
            }
            
            // Fetch files for project from DB
            $database = new Database();
            $conn = $database->getConnection();
            if ($conn) {
                $query = "SELECT id, filename, filepath, content FROM files WHERE project_id = :project_id ORDER BY uploaded_at DESC";
                $stmt = $conn->prepare($query);
                $stmt->execute([':project_id' => $projectId]);
                $files = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($files);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Database connection failed']);
            }
        } elseif ($method === 'DELETE') {
            $projectModel = new Project();
            $project = $projectModel->getById($projectId, $userId);
            if (!$project) {
                http_response_code(403);
                echo json_encode(['error' => 'Access denied to this project']);
                exit;
            }

            $filename = $_GET['filename'] ?? '';
            if (empty($filename)) {
                $data = json_decode(file_get_contents('php://input'), true);
                $filename = $data['filename'] ?? '';
            }


            if (empty($filename)) {
                http_response_code(400);
                echo json_encode(['error' => 'Filename is required']);
                exit;
            }

            $database = new Database();
            $conn = $database->getConnection();
            if ($conn) {
                // Delete file metadata and contents from SQLite
                $query = "DELETE FROM files WHERE project_id = :project_id AND filename = :filename";
                $stmt = $conn->prepare($query);
                $res = $stmt->execute([
                    ':project_id' => $projectId,
                    ':filename' => $filename
                ]);

                // Also delete physical upload file if it exists
                $physicalPath = __DIR__ . '/uploads/' . $projectId . '/' . basename($filename);
                if (file_exists($physicalPath)) {
                    @unlink($physicalPath);
                }

                echo json_encode(['success' => $res, 'message' => 'File deleted successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Database connection failed']);
            }
        }
    } elseif (preg_match('#^/api/projects/([0-9]+)/documents$#', $path, $matches)) {
        $projectId = $matches[1];
        $projectModel = new Project();
        $project = $projectModel->getById($projectId, $userId);
        if (!$project) {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied to this project']);
            exit;
        }
        
        $documentModel = new Document();
        if ($method === 'GET') {
            echo json_encode($documentModel->getByProjectId($projectId));
        } elseif ($method === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            $res = $documentModel->save(
                $projectId, 
                $data['type'], 
                $data['content'], 
                $data['format'] ?? 'markdown'
            );
            if (isset($res['error'])) {
                http_response_code(500);
            }
            echo json_encode($res);
        }
    } elseif ($path === '/api/upload' || $path === '/api/upload.php') {
        require_once __DIR__ . '/api/upload.php';
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found', 'service' => 'Dokari', 'path' => $path]);
    }
}
?>