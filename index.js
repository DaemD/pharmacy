const mysql = require('mysql2/promise');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const path = require('path');
const WebSocket = require('ws'); 
const wss = new WebSocket.Server({ port: 8080 }); // Set the desired port

const fs = require('fs');
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'medicine.html'));
  });

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'login.html'));
  });
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'supplier1.html'));
  });
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'customers.html'));
  });




  wss.on('connection', (ws) => {
      console.log('WebSocket connected');
  
      ws.on('message', (message) => {
        console.log('Received message:', message);
          if (message === 'getTotalCustomers') {
              getNumberOfCustomers((err, numberOfCustomers) => {
                  if (err) {
                      ws.send(JSON.stringify({ type: 'error', message: 'Error fetching number of customers' }));
                  } else {
                      ws.send(JSON.stringify({ type: 'totalCustomers', count: numberOfCustomers }));
                  }
              });
          }
      });

      ws.onerror = (error) => {
        console.error('WebSocket error backedn:', error);
    };
  });


 
  
  
async function getNumberOfCustomers(callback) {
    try {
        const connectionConfig = {
            host: 'localhost',
            database: 'airopharma',
            user: 'root',
            password: 'mascherano',
        };

        const connection = await mysql.createConnection(connectionConfig);

        const [results] = await connection.execute('SELECT COUNT(*) AS count FROM customer');

        const numberOfCustomers = results[0].count;
        callback(null, numberOfCustomers);
    } catch (error) {
        callback(error, null);
    }
}
  
  
  app.get('/senddata', async (req, res) => {

    try {
        const username = req.query.username; // Access the text1 query parameter sent from the client
        const password = req.query.password;
    
        const connectionConfig = {
          host: 'localhost',
          database: 'airopharma',
          user: 'root',
          password: 'mascherano',
        };
    
        const connection = await mysql.createConnection(connectionConfig);
    
        // Compare the hashed password in the database
        const [rows] = await connection.execute(
          'SELECT * FROM cashiers WHERE username = ? AND password = ?',
          [username, password] // Directly use the user-provided password
        );
    
        if (rows.length > 0) {
          let loginstatus = "Validated";
            const response = {
              loginstatus: loginstatus,
            };
            wss.clients.forEach((client) => {
              client.send(JSON.stringify(response));
            });
            console.log(response);


            }
                  else {
                    let loginstatus = "Incorrect";
                    const response = {
                      loginstatus: loginstatus,
                    };
                    wss.clients.forEach((client) => {
                      client.send(JSON.stringify(response));
                    });
                    console.log(response);
        
        
          }
    
        await connection.end();
    
      } catch (error) {
        console.error('Error:', error.message);
      }
  });

  app.get('/sendmedicine', async (req, res) => {
    const {
        medicineName,
        manufacturer,
        stockQuantity,
        unitPrice,
        expiryDate,
        supplierID,
        medicineID
    } = req.query;

    const connectionConfig = {
        host: 'localhost',
        database: 'Airopharma',
        user: 'root',
        password: 'hamzamaqsood@lhr786',
    };

    let connection;

    try {
        connection = await mysql.createConnection(connectionConfig);

        const sql = 'INSERT INTO Medicine (MedicineName, Manufacturer, StockQuantity, UnitPrice, ExpiryDate, SupplierID, MedicineID) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const values = [medicineName, manufacturer, stockQuantity, unitPrice, expiryDate, supplierID, medicineID];

        await connection.query(sql, values);
        let successmessage="Medicine Added Successfully!";
        const response = {
            successmessage: successmessage,
        };

        wss.clients.forEach((client) => {
            client.send(JSON.stringify(response));
        });
        console.log('Data inserted into Medicine table');
        res.send('Data received and inserted successfully');
    } catch (error) {
        console.error('Error:', error.message);

        let responseMessage;
        let statusCode;

        switch (error.code) {
            case 'ER_DUP_ENTRY':
                responseMessage = 'Duplicate entry error. The specified MedicineID already exists.';
                statusCode = 400;
                break;
            case 'ER_NO_REFERENCED_ROW_2':
                responseMessage = 'Foreign key constraint violation. The specified SupplierID does not exist.';
                statusCode = 400;
                break;
            // Add more cases for other error types as needed

            default:
                responseMessage = 'Internal Server Error';
                statusCode = 500;
        }

        const response = {
            errorsinsertion: responseMessage,
        };

        wss.clients.forEach((client) => {
            client.send(JSON.stringify(response));
        });

        console.log(response);
        res.status(statusCode).send(responseMessage);
    } finally {
        // Close the database connection regardless of success or failure
        if (connection) {
            connection.end();
        }
    }
});
app.get('/sendsupplier', async (req, res) => {
    const {
      
        supplierName,
        contactPerson,
        contactNumber,
        supplierAddress
       
    } = req.query;

    const connectionConfig = {
        host: 'localhost',
        database: 'Airopharma',
        user: 'root',
        password: 'hamzamaqsood@lhr786',
    };

    let connection;

    try {
        connection = await mysql.createConnection(connectionConfig);

        const sql = 'INSERT INTO Supplier (SupplierName, ContactPerson, ContactNumber, Address) VALUES (?, ?, ?, ?)';
        const values = [supplierName, contactPerson, contactNumber, supplierAddress];

        await connection.query(sql, values);
        let successmessage="Medicine Added Successfully!";
        const response = {
            successmessage: successmessage,
        };

        wss.clients.forEach((client) => {
            client.send(JSON.stringify(response));
        });
        console.log('Data inserted into Medicine table');
        res.send('Data received and inserted successfully');
    } catch (error) {
        console.error('Error:', error.message);

        let responseMessage;
        let statusCode;

        switch (error.code) {
            case 'ER_DUP_ENTRY':
                responseMessage = 'Duplicate entry error. The specified MedicineID already exists.';
                statusCode = 400;
                break;
            case 'ER_NO_REFERENCED_ROW_2':
                responseMessage = 'Foreign key constraint violation. The specified SupplierID does not exist.';
                statusCode = 400;
                break;
            // Add more cases for other error types as needed

            default:
                responseMessage = 'Internal Server Error';
                statusCode = 500;
        }

        const response = {
            errorsinsertion: responseMessage,
        };

        wss.clients.forEach((client) => {
            client.send(JSON.stringify(response));
        });

        console.log(response);
        res.status(statusCode).send(responseMessage);
    } finally {
        // Close the database connection regardless of success or failure
        if (connection) {
            connection.end();
        }
    }
});
app.get('/deletemedicine', async (req, res) => {
    const medicineID = req.query.medicineid; // Access the text1 query parameter sent from the client
    console.log(medicineID);
    const connectionConfig = {
        host: 'localhost',
        database: 'Airopharma',
        user: 'root',
        password: 'hamzamaqsood@lhr786',
    };

    let connection;

    try {
        connection = await mysql.createConnection(connectionConfig);

        // Check if the medicineID exists before deletion
        const checkSql = 'SELECT * FROM Medicine WHERE MedicineID = ?';
        const checkResult = await connection.query(checkSql, [medicineID]);

        if (checkResult.length === 0) {
            const response = {
                errorsdeletion: 'MedicineID not found. Deletion failed.',
            };

            wss.clients.forEach((client) => {
                client.send(JSON.stringify(response));
            });

            console.log(response);
            res.status(404).send('MedicineID not found. Deletion failed.');
            return;
        }

        // Delete the row with the specified medicineID
        const deleteSql = 'DELETE FROM Medicine WHERE MedicineID = ?';
        await connection.query(deleteSql, [medicineID]);

        let successmessage = 'Medicine Deleted Successfully!';
        const response = {
            successmessage: successmessage,
        };

        wss.clients.forEach((client) => {
            client.send(JSON.stringify(response));
        });

        console.log('Data deleted from Medicine table');
        res.send('Data received and deleted successfully');
    } catch (error) {
        console.error('Error:', error.message);

        let responseMessage;
        let statusCode;

        switch (error.code) {
            // Handle specific error codes as needed
            default:
                responseMessage = 'Internal Server Error';
                statusCode = 500;
        }

        const response = {
            errorsdeletion: responseMessage,
        };

        wss.clients.forEach((client) => {
            client.send(JSON.stringify(response));
        });

        console.log(response);
        res.status(statusCode).send(responseMessage);
    } finally {
        // Close the database connection regardless of success or failure
        if (connection) {
            connection.end();
        }
    }
});
app.get('/deletesupplier', async (req, res) => {
    const suplierid = req.query.suplierid; // Access the text1 query parameter sent from the client
    console.log(suplierid);
    const connectionConfig = {
        host: 'localhost',
        database: 'Airopharma',
        user: 'root',
        password: 'hamzamaqsood@lhr786',
    };

    let connection;

    try {
        connection = await mysql.createConnection(connectionConfig);

        // Check if the medicineID exists before deletion
        const checkSql = 'SELECT * FROM Supplier WHERE SupplierID = ?';
        const checkResult = await connection.query(checkSql, [suplierid]);

        if (checkResult.length === 0) {
            const response = {
                errorsdeletion: 'Supplier not found. Deletion failed.',
            };

            wss.clients.forEach((client) => {
                client.send(JSON.stringify(response));
            });

            console.log(response);
            res.status(404).send('Supplier not found. Deletion failed.');
            return;
        }

        // Delete the row with the specified medicineID
        const deleteSql = 'DELETE FROM Supplier WHERE SupplierID = ?';
        await connection.query(deleteSql, [suplierid]);

        let successmessage = 'Supplier Deleted Successfully!';
        const response = {
            successmessage: successmessage,
        };

        wss.clients.forEach((client) => {
            client.send(JSON.stringify(response));
        });

        console.log('Data deleted from Supplier table');
        res.send('Data received and deleted successfully');
    } catch (error) {
        console.error('Error:', error.message);

        let responseMessage;
        let statusCode;

        switch (error.code) {
            // Handle specific error codes as needed
            default:
                responseMessage = 'Internal Server Error';
                statusCode = 500;
        }

        const response = {
            errorsdeletion: responseMessage,
        };

        wss.clients.forEach((client) => {
            client.send(JSON.stringify(response));
        });

        console.log(response);
        res.status(statusCode).send(responseMessage);
    } finally {
        // Close the database connection regardless of success or failure
        if (connection) {
            connection.end();
        }
    }
});
app.get('/updatemedicine', async (req, res) => {
    const {
        medicineName,
        manufacturer,
        stockQuantity,
        unitPrice,
        expiryDate,
        medicineID
    } = req.query;

    const connectionConfig = {
        host: 'localhost',
        database: 'Airopharma',
        user: 'root',
        password: 'hamzamaqsood@lhr786',
    };

    let connection;

    try {
        connection = await mysql.createConnection(connectionConfig);

        // Check if the specified medicineID exists before updating
        const checkSql = 'SELECT * FROM Medicine WHERE MedicineID = ?';
        const checkResult = await connection.query(checkSql, [medicineID]);

        if (checkResult.length === 0) {
            const response = {
                errorsupdate: 'MedicineID not found. Update failed.',
            };

            wss.clients.forEach((client) => {
                client.send(JSON.stringify(response));
            });

            console.log(response);
            res.status(404).send('MedicineID not found. Update failed.');
            return;
        }
        const findSupplierIdSql = 'SELECT SupplierID FROM Supplier WHERE SupplierName = ?';
        const [supplierIdRows] = await connection.query(findSupplierIdSql, [manufacturer]);
        
        // Check if a matching SupplierID was found
        if (supplierIdRows.length === 0) {
            // Handle the case where no matching supplier is found
            console.error('Supplier not found for the given manufacturer.');
            // Add your error handling code here
        } else {
            const supplierId = supplierIdRows[0].SupplierID;

        // Update the row in the Medicine table based on medicineID
        const updateSql = 'UPDATE Medicine SET MedicineName=?, Manufacturer=?, StockQuantity=?, UnitPrice=?, ExpiryDate=?, SupplierID=? WHERE MedicineID=?';
        const updateValues = [medicineName, manufacturer, stockQuantity, unitPrice, expiryDate, supplierId, medicineID];
    
        await connection.query(updateSql, updateValues);
        let successmessage = 'Medicine Updated Successfully!';
        const response = {
            successmessage: successmessage,
        };

        wss.clients.forEach((client) => {
            client.send(JSON.stringify(response));
        });

        console.log('Data updated in Medicine table');
        res.send('Data received and updated successfully');
    }
    } catch (error) {
        console.error('Error:', error.message);

        let responseMessage;
        let statusCode;

        switch (error.code) {
            // Handle specific error codes as needed
            default:
                responseMessage = 'Internal Server Error';
                statusCode = 500;
        }

        const response = {
            errorsupdate: responseMessage,
        };

        wss.clients.forEach((client) => {
            client.send(JSON.stringify(response));
        });

        console.log(response);
        res.status(statusCode).send(responseMessage);
    } finally {
        // Close the database connection regardless of success or failure
        if (connection) {
            connection.end();
        }
    }
});
app.get('/updatesupplier', async (req, res) => {
    const {
        supplierName,
        contactPerson,
        contactNumber,
        supplierAddress,
        supplierid
    } = req.query;

    const connectionConfig = {
        host: 'localhost',
        database: 'Airopharma',
        user: 'root',
        password: 'hamzamaqsood@lhr786',
    };

    let connection;

    try {
        connection = await mysql.createConnection(connectionConfig);

        // Check if the specified medicineID exists before updating
        const checkSql = 'SELECT * FROM Supplier WHERE SupplierID = ?';
        const checkResult = await connection.query(checkSql, [supplierid]);

        if (checkResult.length === 0) {
            const response = {
                errorsupdate: 'SupplierID not found. Update failed.',
            };

            wss.clients.forEach((client) => {
                client.send(JSON.stringify(response));
            });

            console.log(response);
            res.status(404).send('SupplierID not found. Update failed.');
            return;
        }
       

        // Update the row in the Medicine table based on medicineID
        const updateSql = 'UPDATE Supplier SET SupplierName=?, ContactPerson=?, ContactNumber=?, Address=? WHERE SupplierID=?';
        const updateValues = [supplierName, contactPerson, contactNumber, supplierAddress, supplierid];
    
        await connection.query(updateSql, updateValues);
        let successmessage = 'Supplier Updated Successfully!';
        const response = {
            successmessage: successmessage,
        };

        wss.clients.forEach((client) => {
            client.send(JSON.stringify(response));
        });

        console.log('Data updated in Supplier table');
        res.send('Data received and updated successfully');

    } catch (error) {
        console.error('Error:', error.message);

        let responseMessage;
        let statusCode;

        switch (error.code) {
            // Handle specific error codes as needed
            default:
                responseMessage = 'Internal Server Error';
                statusCode = 500;
        }

        const response = {
            errorsupdate: responseMessage,
        };

        wss.clients.forEach((client) => {
            client.send(JSON.stringify(response));
        });

        console.log(response);
        res.status(statusCode).send(responseMessage);
    } finally {
        // Close the database connection regardless of success or failure
        if (connection) {
            connection.end();
        }
    }
});
app.get('/deletecustomer', async (req, res) => {
    const customerid = req.query.customerid; // Access the text1 query parameter sent from the client
    console.log(customerid);
    const connectionConfig = {
        host: 'localhost',
        database: 'Airopharma',
        user: 'root',
        password: 'hamzamaqsood@lhr786',
    };

    let connection;

    try {
        connection = await mysql.createConnection(connectionConfig);

        // Check if the medicineID exists before deletion
        const checkSql = 'SELECT * FROM Customer WHERE CustomerID = ?';
        const checkResult = await connection.query(checkSql, [customerid]);

        if (checkResult.length === 0) {
            const response = {
                errorsdeletion: 'CustomerID not found. Deletion failed.',
            };

            wss.clients.forEach((client) => {
                client.send(JSON.stringify(response));
            });

            console.log(response);
            res.status(404).send('CustomerID not found. Deletion failed.');
            return;
        }

        // Delete the row with the specified medicineID
        const deleteSql = 'DELETE FROM Customer WHERE CustomerID = ?';
        await connection.query(deleteSql, [customerid]);

        let successmessage = 'customer Deleted Successfully!';
        const response = {
            successmessage: successmessage,
        };

        wss.clients.forEach((client) => {
            client.send(JSON.stringify(response));
        });

        console.log('Data deleted from customer table');
        res.send('Data received and deleted successfully');
    } catch (error) {
        console.error('Error:', error.message);

        let responseMessage;
        let statusCode;

        switch (error.code) {
            // Handle specific error codes as needed
            default:
                responseMessage = 'Internal Server Error';
                statusCode = 500;
        }

        const response = {
            errorsdeletion: responseMessage,
        };

        wss.clients.forEach((client) => {
            client.send(JSON.stringify(response));
        });

        console.log(response);
        res.status(statusCode).send(responseMessage);
    } finally {
        // Close the database connection regardless of success or failure
        if (connection) {
            connection.end();
        }
    }
});

app.get('/sendcustomer', async (req, res) => {
    const {
        firstname,
        lastname,
        contactnumber,
        address
       
    } = req.query;

    const connectionConfig = {
        host: 'localhost',
        database: 'Airopharma',
        user: 'root',
        password: 'hamzamaqsood@lhr786',
    };

    let connection;

    try {
        connection = await mysql.createConnection(connectionConfig);

        const sql = 'INSERT INTO Customer (FirstName, LastName, ContactNumber, Address) VALUES (?, ?, ?, ?)';
        const values = [firstname, lastname, contactnumber, address];

        await connection.query(sql, values);
        let successmessage="Customer Added Successfully!";
        const response = {
            successmessage: successmessage,
        };

        wss.clients.forEach((client) => {
            client.send(JSON.stringify(response));
        });
        console.log('Data inserted into Customer table');
        res.send('Data received and inserted successfully');
    } catch (error) {
        console.error('Error:', error.message);

        let responseMessage;
        let statusCode;

        switch (error.code) {
            case 'ER_DUP_ENTRY':
                responseMessage = 'Duplicate entry error. The specified CustomerID already exists.';
                statusCode = 400;
                break;
            case 'ER_NO_REFERENCED_ROW_2':
                responseMessage = 'Foreign key constraint violation. The specified SupplierID does not exist.';
                statusCode = 400;
                break;
            // Add more cases for other error types as needed

            default:
                responseMessage = 'Internal Server Error';
                statusCode = 500;
        }

        const response = {
            errorsinsertion: responseMessage,
        };

        wss.clients.forEach((client) => {
            client.send(JSON.stringify(response));
        });

        console.log(response);
        res.status(statusCode).send(responseMessage);
    } finally {
        // Close the database connection regardless of success or failure
        if (connection) {
            connection.end();
        }
    }
});
app.get('/updatecustomer', async (req, res) => {
    const {
        customerid,
        firstname,
        lastname,
        contactnumber,
        address
    } = req.query;

    const connectionConfig = {
        host: 'localhost',
        database: 'Airopharma',
        user: 'root',
        password: 'hamzamaqsood@lhr786',
    };

    let connection;

    try {
        connection = await mysql.createConnection(connectionConfig);

        // Check if the specified medicineID exists before updating
        const checkSql = 'SELECT * FROM Customer WHERE CustomerID = ?';
        const checkResult = await connection.query(checkSql, [customerid]);

        if (checkResult.length === 0) {
            const response = {
                errorsupdate: 'Customer not found. Update failed.',
            };

            wss.clients.forEach((client) => {
                client.send(JSON.stringify(response));
            });

            console.log(response);
            res.status(404).send('Customer not found. Update failed.');
            return;
        }
      
           

        // Update the row in the Medicine table based on medicineID
        const updateSql = 'UPDATE Customer SET FirstName=?, LastName=?, ContactNumber=?, Address=? WHERE CustomerID=?';
        const updateValues = [firstname, lastname, contactnumber, address, customerid];
    
        await connection.query(updateSql, updateValues);
        let successmessage = 'Customer Updated Successfully!';
        const response = {
            successmessage: successmessage,
        };

        wss.clients.forEach((client) => {
            client.send(JSON.stringify(response));
        });

        console.log('Data updated in Customer table');
        res.send('Data received and updated successfully');

    } catch (error) {
        console.error('Error:', error.message);

        let responseMessage;
        let statusCode;

        switch (error.code) {
            // Handle specific error codes as needed
            default:
                responseMessage = 'Internal Server Error';
                statusCode = 500;
        }

        const response = {
            errorsupdate: responseMessage,
        };

        wss.clients.forEach((client) => {
            client.send(JSON.stringify(response));
        });

        console.log(response);
        res.status(statusCode).send(responseMessage);
    } finally {
        // Close the database connection regardless of success or failure
        if (connection) {
            connection.end();
        }
    }
});
  async function sendMedicineDataToClient(ws) {
    try {
        const connectionConfig = {
            host: 'localhost',
            database: 'Airopharma',
            user: 'root',
            password: 'mascherano',
          };
      
  
      // Fetch data from the database
      const connection = await mysql.createConnection(connectionConfig);
      const [rows] = await connection.execute('SELECT * FROM Medicine');
      const [supplierRows] = await connection.execute('SELECT SupplierName FROM Supplier');
      const response = {
        medicineData: rows,
        supplierNames: supplierRows.map(row => row.SupplierName),

      };
   

      ws.send(JSON.stringify(response));
    } catch (error) {
      console.error('Error fetching data from the database:', error);
    }
  }
  
  async function sendsupplierdatatoclient(ws) {
    try {
        const connectionConfig = {
            host: 'localhost',
            database: 'Airopharma',
            user: 'root',
            password: 'hamzamaqsood@lhr786',
          };
      
  
      // Fetch data from the database
      const connection = await mysql.createConnection(connectionConfig);
      const [rows] = await connection.execute('SELECT * FROM Supplier');
      const response = {
        supplierdata: rows,
      };
      console.log(rows)


      ws.send(JSON.stringify(response));
    } catch (error) {
      console.error('Error fetching data from the database:', error);
    }
  }
  
  async function sendcustomerdatatoclient(ws) {
    try {
        const connectionConfig = {
            host: 'localhost',
            database: 'Airopharma',
            user: 'root',
            password: 'mascherano',
          };
      
  
      // Fetch data from the database
      const connection = await mysql.createConnection(connectionConfig);
      const [rows] = await connection.execute('SELECT * FROM Customer');
      const response = {
        customerdata: rows,
      };
      console.log(rows)


      ws.send(JSON.stringify(response));
    } catch (error) {
      console.error('Error fetching data from the database:', error);
    }
  }

  async function sendinvoicedatatoclientdashboard(ws) {
    try {
        const connectionConfig = {
            host: 'localhost',
            database: 'Airopharma',
            user: 'root',
            password: 'mascherano',
          };
      
         // connection.query("SELECT Invoice.InvoiceID, CONCAT(Customer.FirstName, ' ', Customer.LastName) AS CustomerName, Invoice.InvoiceDate, Invoice.TotalAmount FROM Invoice JOIN Customer ON Invoice.CustomerID = Customer.CustomerID"
      // Fetch data from the database
      const connection = await mysql.createConnection(connectionConfig);
      const [rows] = await connection.execute("SELECT Invoice.InvoiceID, CONCAT(Customer.FirstName, ' ', Customer.LastName) AS CustomerName, Invoice.InvoiceDate, Invoice.TotalAmount FROM Invoice JOIN Customer ON Invoice.CustomerID = Customer.CustomerID");

      const response = {
        invoicedata: rows,
      };
      console.log(rows)


      ws.send(JSON.stringify(response));
    } catch (error) {
      console.error('Error fetching data from the database:', error);
    }
  }
  wss.on('connection', (ws) => {
   
    sendinvoicedatatoclientdashboard(ws);
  });
 
  wss.on('connection', (ws) => {
    sendsupplierdatatoclient(ws);
    sendMedicineDataToClient(ws);
    sendcustomerdatatoclient(ws);
   
  });


  

  
//send dynamic value in customer box
  async function sendcustomernumbertoclient(ws) {
    try {
      const connectionConfig = {
        host: 'localhost',
        database: 'Airopharma',
        user: 'root',
        password: 'mascherano',
      };
  
      // Establish a connection to the database
      const connection = await mysql.createConnection(connectionConfig);
  
      // Fetch the count of rows from the Customer table
      const [countRows] = await connection.execute('SELECT COUNT(*) AS rowCount FROM Customer');
  
      // Extract the count value from the result
      const rowCount = countRows[0].rowCount;
  
      // Prepare the response object with the count of rows
      const response = {
        rowCountC: rowCount,
      };
  
      // Send the response as JSON to the WebSocket client
      ws.send(JSON.stringify(response));
    } catch (error) {
      console.error('Error fetching data from the database:', error);
    }
  }
  
  wss.on('connection', (ws) => {
    sendcustomernumbertoclient(ws);
  });
  
//send dynamic value of medicine to client

async function sendmedicinenumbertoclient(ws) {
    try {
      const connectionConfig = {
        host: 'localhost',
        database: 'Airopharma',
        user: 'root',
        password: 'mascherano',
      };
  
      // Establish a connection to the database
      const connection = await mysql.createConnection(connectionConfig);
  
      // Fetch the count of rows from the Customer table
      const [countRows] = await connection.execute('SELECT COUNT(*) AS rowCount FROM Medicine');
  
      // Extract the count value from the result
      const rowCount = countRows[0].rowCount;
  
      // Prepare the response object with the count of rows
      const response = {
        rowCountM: rowCount,
      };
  
      // Send the response as JSON to the WebSocket client
      ws.send(JSON.stringify(response));
    } catch (error) {
      console.error('Error fetching data from the database:', error);
    }
  }
  
  wss.on('connection', (ws) => {
    sendmedicinenumbertoclient(ws);
  });
  
//send dynamic value of supplier to client

async function sendsuppliernumbertoclient(ws) {
    try {
      const connectionConfig = {
        host: 'localhost',
        database: 'Airopharma',
        user: 'root',
        password: 'mascherano',
      };
  
      // Establish a connection to the database
      const connection = await mysql.createConnection(connectionConfig);
  
      // Fetch the count of rows from the Customer table
      const [countRows] = await connection.execute('SELECT COUNT(*) AS rowCount FROM supplier');
  
      // Extract the count value from the result
      const rowCount = countRows[0].rowCount;
  
      // Prepare the response object with the count of rows
      const response = {
        rowCountS: rowCount,
      };
  
      // Send the response as JSON to the WebSocket client
      ws.send(JSON.stringify(response));
    } catch (error) {
      console.error('Error fetching data from the database:', error);
    }
  }
  
  wss.on('connection', (ws) => {
    sendsuppliernumbertoclient(ws);
  });

//send dynamic value of outofstock to client

async function sendOutOfStockToClient(ws) {
    try {
        const connectionConfig = {
            host: 'localhost',
            database: 'Airopharma',
            user: 'root',
            password: 'mascherano',
        };

        // Establish a connection to the database
        const connection = await mysql.createConnection(connectionConfig);

       

        // Fetch the count of medicines that are out of stock
        const [outOfStockMedicines] = await connection.execute('SELECT COUNT(*) AS outOfStockMedicinesCount FROM Medicine WHERE StockQuantity = 0');

       
        const rowCount = outOfStockMedicines[0].outOfStockMedicinesCount;

        // Prepare the response object with the counts
        const response = {
         
            rowCountO: rowCount,
        };

        // Send the response as JSON to the WebSocket client
        ws.send(JSON.stringify(response));
    } catch (error) {
        console.error('Error fetching data from the database:', error);
    }
}

wss.on('connection', (ws) => {
    sendOutOfStockToClient(ws);
});

//send dynamic value of invoice number to client

async function sendinvoicenumbertoclient(ws) {
    try {
      const connectionConfig = {
        host: 'localhost',
        database: 'Airopharma',
        user: 'root',
        password: 'mascherano',
      };
  
      // Establish a connection to the database
      const connection = await mysql.createConnection(connectionConfig);
  
      // Fetch the count of rows from the Customer table
      const [countRows] = await connection.execute('SELECT COUNT(*) AS rowCount FROM invoice');
  
      // Extract the count value from the result
      const rowCount = countRows[0].rowCount;
  
      // Prepare the response object with the count of rows
      const response = {
        rowCountI: rowCount,
      };
  
      // Send the response as JSON to the WebSocket client
      ws.send(JSON.stringify(response));
    } catch (error) {
      console.error('Error fetching data from the database:', error);
    }
  }
  
  wss.on('connection', (ws) => {
    sendinvoicenumbertoclient(ws);
  });
//send dynamic value of expired medicine to client

async function sendExpMedicineToClient(ws) {
    try {
        const connectionConfig = {
            host: 'localhost',
            database: 'Airopharma',
            user: 'root',
            password: 'mascherano',
        };

        // Establish a connection to the database
        const connection = await mysql.createConnection(connectionConfig);

        // Fetch the count of expired medicines from the Medicine table
        const [expiredMedicines] = await connection.execute('SELECT COUNT(*) AS rowCountE FROM Medicine WHERE ExpiryDate < NOW()');

        // Extract the count value from the result
        const rowCountE = expiredMedicines[0].rowCountE;

        // Prepare the response object with the count of expired medicines
        const response = {
            rowCountE: rowCountE,
        };

        // Send the response as JSON to the WebSocket client
        ws.send(JSON.stringify(response));
    } catch (error) {
        console.error('Error fetching data from the database:', error);
    }
}

wss.on('connection', (ws) => {
    sendExpMedicineToClient(ws);
});

 

  
//send dynamic value of total amount to client

async function sendTotalAmountToClient(ws) {
    try {
        const connectionConfig = {
            host: 'localhost',
            database: 'Airopharma',
            user: 'root',
            password: 'mascherano',
        };

        // Establish a connection to the database
        const connection = await mysql.createConnection(connectionConfig);

        // Fetch the sum of TotalAmount from the Invoice table
        const [totalAmountRows] = await connection.execute('SELECT SUM(TotalAmount) AS TotalAmount FROM Invoice');

        // Extract the total amount value from the result
        const totalAmount = totalAmountRows[0].TotalAmount;

        // Prepare the response object with the total amount
        const response = {
            totalAmount: totalAmount,
        };

        // Send the response as JSON to the WebSocket client
        ws.send(JSON.stringify(response));
    } catch (error) {
        console.error('Error fetching data from the database:', error);
    }
}
  wss.on('connection', (ws) => {
    sendTotalAmountToClient(ws);
  });
  
// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Software Running on Port ${port}`);
});
