<?php
// Start session
session_start();

// Connect to the SQLite database
$DBSTRING = "sqlite:cse383.db";
include "sql.inc";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

	// Step 3 (Process logout POST variable and set session)
	if(isset($_POST['logout']))
		$_SESSION['loggedin'] = false;

	// Step 1
	// Get the username and pasword from the $_POST variables
	$username = $_POST[username];
	$password = $_POST[password];
	// Prepare and execute the SQL query to validate the login credentials
	try {
		$DATA=GET_SQL("select * from auth where username=? and password=?",$username,$password);
		// Set session variable
		if (count($DATA) > 0) {
			// user and password worked - set session variables
			$_SESSION['loggedin'] = true; 
		} else {
			// No data retrieved - username/password not found
		// Set session variable to not logged in
			//
			$_SESSION['loggedin'] = false;
		}
	}
	catch  (Exception $e) {
		// Database Error
			// Set session variable to not logged in
		$_SESSION['loggedin'] = false;
	}

}
Print "
<!DOCTYPE html>
<html lang='en'>
<head>
<meta charset='UTF-8'>
<meta name='viewport' content='width=device-width, initial-scale=1.0'>
<title>Login</title>
</head>
<body>";
if (!isset($_SESSION['loggedin']) || !$_SESSION['loggedin']) {
    //  Write the login form here  (2.a.i)
    print ("<div>Login Form</div>
<form method='POST'>
  <label for='fname'>First name:</label><br>
  <input type='text' id='fname' name='username'><br>
  <label for='lname'>Last name:</label><br>
  <input type='text' id='lname' name='password'><br><br>
  <input type='submit' value='Submit'>
</form>");
}
else {
    //  Write the logged in secure data here (add a log out function) (2.b.i)
    print ("<h1>You have currently logged in</h1>
<div>Congradulations!</div><form method='POST'>
  <label for='fname'>Logout:</label><br>
  <input type='submit' value='Submit'>
</form>");
}
?>
</body>
</html>

