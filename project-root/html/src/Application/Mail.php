<?php
namespace Application;

use PDO;

class Mail {
    protected PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    // Create new mail
    public function createMail($subject, $body) {
        $stmt = $this->pdo->prepare("INSERT INTO mail (subject, body) VALUES (?, ?) RETURNING id");
        $stmt->execute([$subject, $body]);
        return $stmt->fetchColumn();
    }



    // Get a specific mail
    public function getMail($id) {
        $stmt = $this->pdo->prepare("SELECT * FROM mail WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }


    // Get all mail
    public function getAllMail() {
        $stmt = $this->pdo->query("SELECT * FROM mail ORDER BY id ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }



    // Update a specific mail
    public function updateMail($id, $subject, $body) {
        $stmt = $this->pdo->prepare("UPDATE mail SET subject = ?, body = ? WHERE id = ?");
        $stmt->execute([$subject, $body, $id]);
        return $stmt->rowCount(); 
    }

    
    // Delete a specific mail 
    public function deleteMail($id) {
        $stmt = $this->pdo->prepare("DELETE FROM mail WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->rowCount(); 
    }


}