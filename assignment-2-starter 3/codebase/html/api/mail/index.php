<?php
require  __DIR__ . '/../../../autoload.php';

use Application\Mail;
use Application\Database;
use Application\Page;
use Application\Verifier;

$database = new Database('prod');
$page = new Page();

$mail = new Mail($database->getDb());

$verifier = new Verifier();
$verifier->decode($_SERVER['HTTP_AUTHORIZATION']);

// Check if the user is authorized(Jwt tokens is valid)
if (!$verifier->userId) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (array_key_exists('name', $data) && array_key_exists('message', $data)) {

        // Get the user ID from the verifier(token)
        $userId = $verifier->userId;
        $id = $mail->createMail($data['name'], $data['message'], $userId);
        $page->item(array("id" => $id));
    } else {
        $page->badRequest();
    }
} else if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    // Get all mail if role is admin
    if ($verifier->role === 'admin') {
        $page->item($mail->listMail());

    } else {
        // Get user mail for the regular user
        $page->item($mail->listMail($verifier->userId));
    }
} else {
    $page->badRequest();
}