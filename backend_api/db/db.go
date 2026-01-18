package db

import (
	"database/sql"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

func DbInit() error {
	db, err := sql.Open("mysql", "root:password@tcp(127.0.0.1:3306)/") //CHANGE LOCAL ADDRESS DB IN PROD

	if err != nil {
		log.Print("Not a ping error")
		return err

	}
	if err := db.Ping(); err != nil {
		log.Print("Ping error")
		return err
	}
	_, errdbCreate := db.Exec("CREATE DATABASE IF NOT EXISTS Cliniq")

	if errdbCreate != nil {
		log.Fatal("Failed at db creation")
		return err
	}
	defer db.Close()
	dbSelect, err := sql.Open("mysql", "root:password@tcp(127.0.0.1:3306)/Cliniq") //CHANGE LOCAL DB ADDRESS IN PROD
	if err != nil {
		log.Fatal(err)
		return err
	}
	query := `			
						CREATE TABLE users(
							id INT AUTO_INCREMENT PRIMARY KEY,
							name text NOT NULL	);`
	_, errdbExec := dbSelect.Exec(query)
	if errdbExec != nil {
		log.Fatal(errdbExec)
		return errdbExec
	}

	log.Printf("DB started")
	return nil
}
