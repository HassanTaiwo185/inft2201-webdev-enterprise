<?php
use PHPUnit\Framework\TestCase;
use Application\Mail;

class MailTest extends TestCase {
    protected PDO $pdo;

    protected function setUp(): void
    {
        $dsn = "pgsql:host=" . getenv('DB_TEST_HOST') . ";dbname=" . getenv('DB_TEST_NAME');
        $this->pdo = new PDO($dsn, getenv('DB_USER'), getenv('DB_PASS'));
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Clean and reinitialize the table
        $this->pdo->exec("DROP TABLE IF EXISTS mail;");
        $this->pdo->exec("
            CREATE TABLE mail (
                id SERIAL PRIMARY KEY,
                subject TEXT NOT NULL,
                body TEXT NOT NULL
            );
        ");
    }

     // Test create mail
    public function testCreateMail() {
        $mail = new Mail($this->pdo);
        $id = $mail->createMail("Alice", "Hello world");
        $this->assertIsInt($id);
        $this->assertEquals(1, $id);
    }

    // Test Get specific mail
    public function testGetMailByid(){
        $mail = new Mail($this->pdo);
        $id = $mail->createMail("Test Get By id", "Retrieve a specific entry");

        $result = $mail->getMail($id);

        $this->assertEquals("Test Get By id", $result['subject']);
        $this->assertEquals("Retrieve a specific entry", $result['body']);


    }

    // Test Get all mail
    public function testGetAllMail(){
         $mail = new Mail($this->pdo);


         $mail->createMail("First mail", "Hello world");
         $mail->createMail("Second mail", "Retrieve a specific entry");
         $mail->createMail("Third mail", "How are you");

         $result = $mail->getAllMail();

         $this->assertCount(3, $result);
         $this->assertEquals("First mail", $result[0]['subject']);
         $this->assertEquals("Second mail", $result[1]['subject']);
         $this->assertEquals("Third mail", $result[2]['subject']);
    }

    // Test update specific mail
    public function testUpdateMail(){

        $mail = new Mail($this->pdo);
        $id = $mail->createMail("Old", "Hello world");

        $mail->updateMail($id, "New", "Hello planet");  
        $updated = $mail->getMail($id);

        $this->assertEquals("New", $updated['subject']);
        $this->assertEquals("Hello planet", $updated['body']);

    }

    // Test Delete specific mail
    public function testDeleteMail() {
    $mail = new Mail($this->pdo);
    $id = $mail->createMail("Delete", "This mail is deleted");

    $mail->deleteMail($id);  
    $deleted = $mail->getMail($id);

    $this->assertFalse($deleted); 
}



}