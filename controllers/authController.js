const db = require("../db/connection");
const userTransectionHistory = require("../db/userTransectionHistory");
const agentTransectionHistory = require("../db/agentTransectionHistory");

// Controller to handle user signup
exports.signupUser = (req, res) => {
  const { name, no, password } = req.body;

  if (!name || !no || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Check if the user already exists
  const checkQuery = "SELECT * FROM users WHERE no = ?";
  db.query(checkQuery, [no], (err, results) => {
    if (err) {
      console.error("Error checking user:", err);
      return res.status(500).json({ error: "Internal server error." });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: "no already in use." });
    }

    // Insert new user into the database
    const insertQuery = "INSERT INTO users (name, no, password) VALUES (?, ?, ?)";
    db.query(insertQuery, [name, no, password], (err, result) => {
      if (err) {
        console.error("Error inserting user:", err);
        return res.status(500).json({ error: "Internal server error." });
      }

      const createTableQuery = `
      CREATE TABLE IF NOT EXISTS history_${no} (   
       id INT AUTO_INCREMENT PRIMARY KEY,      
        no VARCHAR(14) NOT NULL,
        type VARCHAR(50) NOT NULL,
        amount FLOAT NOT NULL,
        charge FLOAT NOT NULL
      )
    `;

    userTransectionHistory.query(createTableQuery, (err) => {
      if (err) {
        console.error("Error creating table:", err);
        return res.status(500).json({ error: "Failed to create table." });
      }

      res.status(201).json({ message: "User registered successfully!" });
    });
    });


  });
};
exports.agentSignupUser = (req, res) => {
  const { name, no, password } = req.body;

  if (!name || !no || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Check if the user already exists
  const checkQuery = "SELECT * FROM agent_users WHERE no = ?";
  db.query(checkQuery, [no], (err, results) => {
    if (err) {
      console.error("Error checking user:", err);
      return res.status(500).json({ error: "Internal server error." });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: "no already in use." });
    }

    // Insert new user into the database
    const insertQuery = "INSERT INTO agent_users (name, no, password) VALUES (?, ?, ?)";
    db.query(insertQuery, [name, no, password], (err, result) => {
      if (err) {
        console.error("Error inserting user:", err);
        return res.status(500).json({ error: "Internal server error." });
      }

      
      const createTableQuery = `
          CREATE TABLE IF NOT EXISTS agent_${no} (
              id INT AUTO_INCREMENT PRIMARY KEY, 
              no VARCHAR(14) NOT NULL,
              amount FLOAT NOT NULL,
              profit FLOAT NOT NULL,
              type VARCHAR(50) NOT NULL
      )
    `;

    agentTransectionHistory.query(createTableQuery, (err) => {
      if (err) {
        console.error("Error creating table:", err);
        return res.status(500).json({ error: "Failed to create table." });
      }

      res.status(201).json({ message: "User registered successfully!" });
    });
    });
  });
};

// Controller to handle user login
exports.loginUser = (req, res) => {
  const { no, password } = req.body;

  if (!no || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Check if the user exists and the password matches
  const loginQuery = "SELECT * FROM users WHERE no = ? AND password = ?";
  db.query(loginQuery, [no, password], (err, results) => {
    if (err) {
      console.error("Error during login:", err);
      return res.status(500).json({ error: "Internal server error." });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // On successful login
    res.status(200).json({ message: "Login successful!", user: results[0] });
  });
};
exports.agentloginUser = (req, res) => {
  const { no, password } = req.body;

  if (!no || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Check if the user exists and the password matches
  const loginQuery = "SELECT * FROM agent_users WHERE no = ? AND password = ?";
  db.query(loginQuery, [no, password], (err, results) => {
    if (err) {
      console.error("Error during login:", err);
      return res.status(500).json({ error: "Internal server error." });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // On successful login
    res.status(200).json({ message: "Login successful!", user: results[0] });
  });
};
exports.organizationlogin = (req, res) => {
  const { no, password } = req.body;

  if (!no || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Check if the user exists and the password matches
  const loginQuery = "SELECT * FROM company_balance WHERE ID = ? AND password = ?";
  db.query(loginQuery, [no, password], (err, results) => {
    if (err) {
      console.error("Error during login:", err);
      return res.status(500).json({ error: "Internal server error." });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // On successful login
    res.status(200).json({ message: "Login successful!", user: results[0] });
  });
};




exports.handleSendMoney = (req, res) => {
  const { senderNo, receiverNo, amount } = req.body;

  if (!senderNo || !receiverNo || !amount) {
    return res.status(400).json({ error: "Sender number, receiver number, and amount are required." });
  }

  if (senderNo === receiverNo) {
    return res.status(400).json({ error: "Sender and receiver numbers cannot be the same." });
  }

  // Validate amount
  if (amount <= 0) {
    return res.status(400).json({ error: "Amount must be greater than zero." });
  }

  // Step 1: Check if the sender exists
  const checkSenderQuery = "SELECT * FROM users WHERE no = ?";
  db.query(checkSenderQuery, [senderNo], (err, senderResults) => {
    if (err) {
      console.error("Database error while finding sender:", err);
      return res.status(500).json({ error: "Internal server error." });
    }

    if (senderResults.length === 0) {
      return res.status(404).json({ error: "Sender not found." });
    }

    const senderBalance = senderResults[0].balance;

    // Step 2: Validate sender's balance
    if (senderBalance < amount) {
      return res.status(400).json({ error: "Insufficient balance." });
    }

    // Step 3: Check if the receiver exists
    const checkReceiverQuery = "SELECT * FROM users WHERE no = ?";
    db.query(checkReceiverQuery, [receiverNo], (err, receiverResults) => {
      if (err) {
        console.error("Database error while finding receiver:", err);
        return res.status(500).json({ error: "Internal server error." });
      }

      if (receiverResults.length === 0) {
        return res.status(404).json({ error: "Receiver not found." });
      }

      // Step 4: Deduct amount from sender and add to receiver
      const updateSenderQuery = "UPDATE users SET balance = balance - ? WHERE no = ?";
      const updateReceiverQuery = "UPDATE users SET balance = balance + ? WHERE no = ?";
      
      db.query(updateSenderQuery, [amount, senderNo], (err) => {
        if (err) {
          console.error("Error deducting amount from sender:", err);
          return res.status(500).json({ error: "Transaction failed." });
        }

        db.query(updateReceiverQuery, [amount, receiverNo], (err) => {
          if (err) {
            console.error("Error adding amount to receiver:", err);
            return res.status(500).json({ error: "Transaction failed." });
          }

          // Step 5: Log the transaction
          const logTransactionQuery = `
            INSERT INTO history_${senderNo} (no,type, amount, charge) 
            VALUES (?, ?, ?, ?)`;
          const transactionType = "Out Send Money";
          const description = `${transactionType} of $${amount}`;
          
          userTransectionHistory.query(logTransactionQuery, [receiverNo, transactionType, amount, 0], (err) => {
            if (err) {
              console.error("Error logging transaction:", err);
              return res.status(500).json({ error: "Transaction logging failed." });
            }

            const logTransactionQuery = `
            INSERT INTO history_${receiverNo} (no,type, amount, charge) 
            VALUES (?, ?, ?, ?)`;
          const transactionType = "In Send Money";
          const description = `${transactionType} of $${amount}`;
          
          userTransectionHistory.query(logTransactionQuery, [senderNo, transactionType, amount, 0], (err) => {
            if (err) {
              console.error("Error logging transaction:", err);
              return res.status(500).json({ error: "Transaction logging failed." });
            }


                const organazation_transection = `
                INSERT INTO organazation_transection (senderno,receiverno,amount,charge,profit,type) 
                VALUES (?, ?,?, ?,?,?)`;
              const transactionType = "p2psendMoney";
              const description = `${transactionType} of $${amount}`;
              
              db.query(organazation_transection, [senderNo,receiverNo,amount, 0,0 ,transactionType ], (err) => {
                if (err) {
                  console.error("Error logging transaction:", err);
                  return res.status(500).json({ error: "Transaction logging failed." });
                }


            // Success response
            return res.status(200).json({ message: `${description} was successful.` });
          });
          });
          });
        });
      });
    });
  });
};
exports.Cashout = (req, res) => {
  const { senderNo, receiverNo, } = req.body;
  const amount = parseInt(req.body.amount); // Convert input to an integer
  if (!senderNo || !receiverNo || !amount) {
    return res.status(400).json({ error: "Sender number, receiver number, and amount are required." });
  }

  // if (senderNo === receiverNo) {
  //   return res.status(400).json({ error: "Sender and receiver numbers cannot be the same." });
  // }


  const cashOutFee = (amount*0.1) ;

  const cashOutWithFee = ( amount + cashOutFee);
  const AgentProfit =  (cashOutFee*0.4) 
  const amountWithProfit_agent = (amount + AgentProfit)
  const companyProfit =  (cashOutFee*0.6) 
  
  
  // Validate amount
  if (cashOutWithFee <= 0) {
    return res.status(400).json({ error: "Amount must be greater than zero." });
  }

  // Step 1: Check if the sender exists
  const checkSenderQuery = "SELECT * FROM users WHERE no = ?";
  db.query(checkSenderQuery, [senderNo], (err, senderResults) => {
    if (err) {
      console.error("Database error while finding sender:", err);
      return res.status(500).json({ error: "Internal server error." });
    }

    if (senderResults.length === 0) {
      return res.status(404).json({ error: "Sender not found." });
    }

    const senderBalance = senderResults[0].balance;

    // Step 2: Validate sender's balance
    if (senderBalance < cashOutWithFee) {
      return res.status(400).json({ error: "Insufficient balance." });
    }

    // Step 3: Check if the receiver exists
    const checkReceiverQuery = "SELECT * FROM agent_users WHERE no = ?";
    db.query(checkReceiverQuery, [receiverNo], (err, receiverResults) => {
      if (err) {
        console.error("Database error while finding receiver:", err);
        return res.status(500).json({ error: "Internal server error." });
      }

      if (receiverResults.length === 0) {
        return res.status(404).json({ error: "Receiver not found." });
      }

      // Step 4: Deduct amount from sender and add to receiver
      const updateSenderQuery = "UPDATE users SET balance = balance - ? WHERE no = ?";
      const updateReceiverQuery = "UPDATE agent_users SET balance = balance + ? WHERE no = ?";
      const updateOrgQuery = "UPDATE company_balance SET company_balance = company_balance + ? WHERE ID = 1";
      
      db.query(updateSenderQuery, [cashOutWithFee, senderNo], (err) => {
        if (err) {
          console.error("Error deducting amount from sender:", err);
          return res.status(500).json({ error: "Transaction failed." });
        }

        db.query(updateReceiverQuery, [amountWithProfit_agent, receiverNo], (err) => {
          if (err) {
            console.error("Error adding amount to receiver:", err);
            return res.status(500).json({ error: "Transaction failed." });
          }
          db.query(updateOrgQuery, [companyProfit], (err) => {
            if (err) {
              console.error("Error adding amount to receiver:", err);
              return res.status(500).json({ error: "Transaction failed." });
            }

          const senderHistory = `
            INSERT INTO history_${senderNo} (no, type,amount,charge) 
            VALUES (?, ?, ?,?)`;
            const type = "Cashout"
            userTransectionHistory.query(senderHistory, [receiverNo, type, amount,cashOutFee ], (err) => {
            if (err) {
              console.error("Error logging profit:", err);
              return res.status(500).json({ error: "Profit logging failed." });
            }

          // Step 5: Log the transaction
          const agentHistory = `
            INSERT INTO agent_${receiverNo} (no,amount,profit,type) 
            VALUES (?, ?,?, ?)`;
          const transactionType = "Cash Out";
          const description = `${transactionType} of $${amount}`;
          
          agentTransectionHistory.query(agentHistory, [receiverNo,amount,AgentProfit,transactionType ], (err) => {
            if (err) {
              console.error("Error logging transaction:", err);
              return res.status(500).json({ error: "Transaction logging failed." });
            }

          const organazation_transection = `
            INSERT INTO organazation_transection (senderno,receiverno,amount,charge,profit,type) 
            VALUES (?, ?,?, ?,?,?)`;
          const transactionType = "Cash Out";
          const description = `${transactionType} of $${amount}`;
          
          db.query(organazation_transection, [senderNo,receiverNo,amount, cashOutFee,companyProfit ,transactionType ], (err) => {
            if (err) {
              console.error("Error logging transaction:", err);
              return res.status(500).json({ error: "Transaction logging failed." });
            }

            // Success response
            return res.status(200).json({ message: `${description} was successful.` });
          });
          });
          });
          });
        });
      });
    });
  });
};





exports.userCashIn= (req, res) => {
  const {  senderNo,receiverNo, amount,transactionType } = req.body;

  if ( !receiverNo || !amount) {
    return res.status(400).json({ error: " receiver number, and amount are required." });
  }

  // Validate amount
  if (amount <= 0) {
    return res.status(400).json({ error: "Amount must be greater than zero." });
  }

  // Step 1: Check if the sender exists
  const checkSenderQuery = "SELECT * FROM agent_users WHERE no = ?";
  db.query(checkSenderQuery, [senderNo], (err, senderResults) => {
    if (err) {
      console.error("Database error while finding sender:", err);
      return res.status(500).json({ error: "Internal server error." });
    }

    if (senderResults.length === 0) {
      return res.status(404).json({ error: "Sender not found." });
    }

    const senderBalance = senderResults[0].balance;

    // Step 2: Validate sender's balance
    if (senderBalance < amount) {
      return res.status(400).json({ error: "Insufficient balance." });
    }

    // Step 3: Check if the receiver exists
    const checkReceiverQuery = "SELECT * FROM users WHERE no = ?";
    db.query(checkReceiverQuery, [receiverNo], (err, receiverResults) => {
      if (err) {
        console.error("Database error while finding receiver:", err);
        return res.status(500).json({ error: "Internal server error." });
      }

      if (receiverResults.length === 0) {
        return res.status(404).json({ error: "Receiver not found." });
      }

      // Step 4: Deduct amount from sender and add to receiver
      const updateSenderQuery = "UPDATE agent_users SET balance = balance - ? WHERE no = ?";
      const updateReceiverQuery = "UPDATE users SET balance = balance + ? WHERE no = ?";
      
      db.query(updateSenderQuery, [amount, senderNo], (err) => {
        if (err) {
          console.error("Error deducting amount from sender:", err);
          return res.status(500).json({ error: "Transaction failed." });
        }

        db.query(updateReceiverQuery, [amount, receiverNo], (err) => {
          if (err) {
            console.error("Error adding amount to receiver:", err);
            return res.status(500).json({ error: "Transaction failed." });
          }

            const userHistory = `
            INSERT INTO history_${ receiverNo} (no, type,amount,charge) 
            VALUES (?, ?, ?,?)`;
            const type = "CashIn"
            userTransectionHistory.query(userHistory, [senderNo, type, amount,0 ], (err) => {
            if (err) {
              console.error("Error logging profit:", err);
              return res.status(500).json({ error: "Profit logging failed." });
            }

          // Step 5: Log the transaction
          const agentHistory = `
            INSERT INTO agent_${senderNo} (no,amount,profit,type) 
            VALUES (?, ?,?, ?)`;
          const transactionType = "user CashIn";
          const description = `${transactionType} of $${amount}`;
          
          agentTransectionHistory.query(agentHistory, [receiverNo,amount,0,transactionType ], (err) => {
            if (err) {
              console.error("Error logging transaction:", err);
              return res.status(500).json({ error: "Transaction logging failed." });
            }

          const organazation_transection = `
            INSERT INTO organazation_transection (senderno,receiverno,amount,charge,profit,type) 
            VALUES (?, ?,?, ?,?,?)`;
          const transactionType = "user CashIn";
          const description = `${transactionType} of $${amount}`;
          
          db.query(organazation_transection, [senderNo,receiverNo,amount, 0,0 ,transactionType ], (err) => {
            if (err) {
              console.error("Error logging transaction:", err);
              return res.status(500).json({ error: "Transaction logging failed." });
            }
          

            // Success response
            return res.status(200).json({ message: `${transactionType} was successful.` });
          
        });
        });
        });
        });
      });
    });
  });
};
exports.agentWithdraw = (req, res) => {
  const { no  } = req.body;

  const amount = parseInt(req.body.amount)

  if (!amount || !no) {
    return res.status(400).json({ error: " receiver number, and amount are required." });
  }

  // Validate amount
  if (amount <= 0) {
    return res.status(400).json({ error: "Amount must be greater than zero." });
  }

  // Step 1: Check if the sender exists
  const checkSenderQuery = "SELECT * FROM agent_users WHERE no = ?";
  db.query(checkSenderQuery, [no], (err, senderResults) => {
    if (err) {
      console.error("Database error while finding sender:", err);
      return res.status(500).json({ error: "Internal server error." });
    }

    if (senderResults.length === 0) {
      return res.status(404).json({ error: "Sender not found." });
    }

    const senderBalance = senderResults[0].balance;

    // Step 2: Validate sender's balance
    if (senderBalance < amount) {
      return res.status(400).json({ error: "Insufficient balance." });
    }

    // Step 3: Check if the receiver exists
    const checkReceiverQuery = "SELECT * FROM company_balance WHERE ID = ?";
    db.query(checkReceiverQuery, [1], (err, receiverResults) => {
      if (err) {
        console.error("Database error while finding receiver:", err);
        return res.status(500).json({ error: "Internal server error." });
      }

      if (receiverResults.length === 0) {
        return res.status(404).json({ error: "Receiver not found." });
      }

      // const receiverBalance = receiverResults[0].company_balance;

      // Step 4: Deduct amount from sender and add to receiver
      const updateSenderQuery = "UPDATE agent_users SET balance = balance - ? WHERE no = ?";
      const updateReceiverQuery = "UPDATE company_balance SET company_balance = company_balance + ? WHERE ID = ?";
      
      db.query(updateSenderQuery, [amount, no], (err) => {
        if (err) {
          console.error("Error deducting amount from sender:", err);
          return res.status(500).json({ error: "Transaction failed." });
        }

        db.query(updateReceiverQuery, [amount, 1], (err) => {
          if (err) {
            console.error("Error adding amount to receiver:", err);
            return res.status(500).json({ error: "Transaction failed." });
          }

              const agentHistory = `
              INSERT INTO agent_${no} (no,amount,profit,type) 
              VALUES (?, ?,?, ?)`;
            const transactionType = "Agent Withdraw";
            const description = `${transactionType} of $${amount}`;
            
            agentTransectionHistory.query(agentHistory, ["Organization",amount,0,transactionType ], (err) => {
              if (err) {
                console.error("Error logging transaction:", err);
                return res.status(500).json({ error: "Transaction logging failed." });
              }

            const organazation_transection = `
              INSERT INTO organazation_transection (senderno,receiverno,amount,charge,profit,type) 
              VALUES (?, ?,?, ?,?,?)`;
            const transactionType = "Agent Withdraw";
            const description = `${transactionType} of $${amount}`;
            
            db.query(organazation_transection, [no,"Organization",amount, 0,0 ,transactionType ], (err) => {
              if (err) {
                console.error("Error logging transaction:", err);
                return res.status(500).json({ error: "Transaction logging failed." });
              }



            // Success response
            return res.status(200).json({ message: `${transactionType} was successful.` });
          
        });
        });
        });
      });
    });
  });
};





exports.companySendmoney = (req, res) => {
  const {  receiverNo, amount,transactionType } = req.body;

  if ( !receiverNo || !amount) {
    return res.status(400).json({ error: " receiver number, and amount are required." });
  }

  // Validate amount
  if (amount <= 0) {
    return res.status(400).json({ error: "Amount must be greater than zero." });
  }

  // Step 1: Check if the sender exists
  const checkSenderQuery = "SELECT * FROM company_balance WHERE ID = ?";
  db.query(checkSenderQuery, [1], (err, senderResults) => {
    if (err) {
      console.error("Database error while finding sender:", err);
      return res.status(500).json({ error: "Internal server error." });
    }

    if (senderResults.length === 0) {
      return res.status(404).json({ error: "Sender not found." });
    }

    const senderBalance = senderResults[0].company_balance;

    // Step 2: Validate sender's balance
    if (senderBalance < amount) {
      return res.status(400).json({ error: "Insufficient balance." });
    }

    // Step 3: Check if the receiver exists
    const checkReceiverQuery = "SELECT * FROM agent_users WHERE no = ?";
    db.query(checkReceiverQuery, [receiverNo], (err, receiverResults) => {
      if (err) {
        console.error("Database error while finding receiver:", err);
        return res.status(500).json({ error: "Internal server error." });
      }

      if (receiverResults.length === 0) {
        return res.status(404).json({ error: "Receiver not found." });
      }

      // Step 4: Deduct amount from sender and add to receiver
      const updateSenderQuery = "UPDATE company_balance SET company_balance = company_balance - ? WHERE ID = ?";
      const updateReceiverQuery = "UPDATE agent_users SET balance = balance + ? WHERE no = ?";
      
      db.query(updateSenderQuery, [amount, 1], (err) => {
        if (err) {
          console.error("Error deducting amount from sender:", err);
          return res.status(500).json({ error: "Transaction failed." });
        }

        db.query(updateReceiverQuery, [amount, receiverNo], (err) => {
          if (err) {
            console.error("Error adding amount to receiver:", err);
            return res.status(500).json({ error: "Transaction failed." });
          }


              const agentHistory = `
              INSERT INTO agent_${receiverNo} (no,amount,profit,type) 
              VALUES (?, ?,?, ?)`;
            const transactionType = "Agent CashIn";
            const description = `${transactionType} of $${amount}`;
            
            agentTransectionHistory.query(agentHistory, ["Organization",amount,0,transactionType ], (err) => {
              if (err) {
                console.error("Error logging transaction:", err);
                return res.status(500).json({ error: "Transaction logging failed." });
              }

            const organazation_transection = `
              INSERT INTO organazation_transection (senderno,receiverno,amount,charge,profit,type) 
              VALUES (?, ?,?, ?,?,?)`;
            const transactionType = "Agent CashIn";
            const description = `${transactionType} of $${amount}`;
            
            db.query(organazation_transection, ["Organization", receiverNo,amount, 0,0 ,transactionType ], (err) => {
              if (err) {
                console.error("Error logging transaction:", err);
                return res.status(500).json({ error: "Transaction logging failed." });
              }

        

            // Success response
            return res.status(200).json({ message: `${transactionType} was successful.` });
          
        });
        });
        });
      });
    });
  });
};








// Function to handle transactions (Send Money, Cashout, Payment, Recharge)

exports.showBalance = (req, res) => {
  const { no,tablename } = req.body;  // Mobile number from the request body
  // const tablename = sessionStorage.getItem("tablename");
  
  // if (!no || !tablename) {
  //   return res.status(400).json({ error: "Mobile number is required." });
  // }
 
  const query = `SELECT balance, name FROM ${tablename} WHERE no = ?`;
  // console.log(query,"query");
  
  db.query(query, [no], (err, results) => {
    if (err) {
      console.error("Error fetching balance:", err);
      return res.status(500).json({ error: "Internal server error." });
    }

    if (results.length > 0) {
      // Assuming balance is stored in the `balance` column
      const balance = results[0].balance;
      const name = results[0].name;
      res.status(200).json({ balance, name });
    } else {
      res.status(404).json({ error: "User not found." });
    }
  });
};
exports.companyShowBalance = (req, res) => {
  // const { no } = req.body;  // Mobile number from the request body

  // if (!no) {
  //   return res.status(400).json({ error: "Mobile number is required." });
  // }

  const query = "SELECT company_balance FROM company_balance WHERE ID = 1";
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching balance:", err);
      return res.status(500).json({ error: "Internal server error." });
    }

    if (results.length > 0) {
      // Assuming balance is stored in the `balance` column
      const balance = results[0].company_balance;
      
      res.status(200).json({ balance });
    } else {
      res.status(404).json({ error: "User not found." });
    }
  });
};





exports.agent_transection = (req, res) => {  
  const {senderNo} = req.body;
  
  // Your query to fetch data from the 'organazation_transection' table
  const query = `SELECT * FROM agent_${senderNo} ORDER BY id DESC`;
  agentTransectionHistory.query(query, (err, results) => {
      if (err) {
          console.error("Error fetching transactions:", err);
          return res.status(500).json({ error: "Database error." });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: "No transactions found." });
      }
      // console.log(results);
      

      // Send the response with the fetched results
      return res.status(200).json(results);
  });
};
exports.agent_transection_CashOut = (req, res) => {  
  const {senderNo} = req.body;
  // Your query to fetch data from the 'organazation_transection' table
  const query = `SELECT * FROM agent_${senderNo} where type = "Cash Out" ORDER BY id DESC`;
  agentTransectionHistory.query(query, (err, results) => {
      if (err) {
          console.error("Error fetching transactions:", err);
          return res.status(500).json({ error: "Database error." });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: "No transactions found." });
      }
      // console.log(results);
      

      // Send the response with the fetched results
      return res.status(200).json(results);
  });
};
exports.agent_transection_UserCashIn= (req, res) => {
  const {senderNo} = req.body;
  
  // Your query to fetch data from the 'organazation_transection' table
  const query = `SELECT * FROM agent_${senderNo} where type = "user CashIn" ORDER BY id DESC`;
  
  
  agentTransectionHistory.query(query, (err, results) => {
      if (err) {
          console.error("Error fetching transactions:", err);
          return res.status(500).json({ error: "Database error." });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: "No transactions found." });
      }
      // console.log(results);
      

      // Send the response with the fetched results
      return res.status(200).json(results);
  });
};
exports.agent_transection_withdraw = (req, res) => {
  const {senderNo} = req.body;
  // Your query to fetch data from the 'organazation_transection' table
  const query = `SELECT * FROM agent_${senderNo}  where type = "Agent Withdraw" ORDER BY id DESC`;
  agentTransectionHistory.query(query, (err, results) => {
      if (err) {
          console.error("Error fetching transactions:", err);
          return res.status(500).json({ error: "Database error." });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: "No transactions found." });
      }
      // console.log(results);
      

      // Send the response with the fetched results
      return res.status(200).json(results);
  });
};
exports.agent_transection_agentCashIn = (req, res) => {
  const {senderNo} = req.body;
  // Your query to fetch data from the 'organazation_transection' table
  const query = `SELECT * FROM agent_${senderNo}  where type = "Agent CashIn" ORDER BY id DESC`;
  agentTransectionHistory.query(query, (err, results) => {
      if (err) {
          console.error("Error fetching transactions:", err);
          return res.status(500).json({ error: "Database error." });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: "No transactions found." });
      }
      // console.log(results);
      

      // Send the response with the fetched results
      return res.status(200).json(results);
  });
};


exports.user_All = (req, res) => {  
  const {senderNo} = req.body;
  
  // Your query to fetch data from the 'organazation_transection' table
  const query = `SELECT * FROM history_${senderNo} ORDER BY id DESC`;
  userTransectionHistory.query(query, (err, results) => {
      if (err) {
          console.error("Error fetching transactions:", err);
          return res.status(500).json({ error: "Database error." });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: "No transactions found." });
      }
      // console.log(results);
      

      // Send the response with the fetched results
      return res.status(200).json(results);
  });
};
exports.user_CashIn = (req, res) => {  
  const {senderNo} = req.body;
  // Your query to fetch data from the 'organazation_transection' table
  const query = `SELECT * FROM history_${senderNo} where type = "CashIn" ORDER BY id DESC`;
  userTransectionHistory.query(query, (err, results) => {
      if (err) {
          console.error("Error fetching transactions:", err);
          return res.status(500).json({ error: "Database error." });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: "No transactions found." });
      }
      // console.log(results);
      

      // Send the response with the fetched results
      return res.status(200).json(results);
  });
};
exports.user_Cashout= (req, res) => {
  const {senderNo} = req.body;
  
  // Your query to fetch data from the 'organazation_transection' table
  const query = `SELECT * FROM history_${senderNo} where type = "Cashout" ORDER BY id DESC`;
  // console.log(query,"queryquery");
  
  userTransectionHistory.query(query, (err, results) => {
      if (err) {
          console.error("Error fetching transactions:", err);
          return res.status(500).json({ error: "Database error." });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: "No transactions found." });
      }
      // console.log(results);
      

      // Send the response with the fetched results
      return res.status(200).json(results);
  });
};
exports.user_InSendMoney = (req, res) => {
  const {senderNo} = req.body;
  // Your query to fetch data from the 'organazation_transection' table
  const query = `SELECT * FROM history_${senderNo}  where type = "In Send Money" ORDER BY id DESC`;
  userTransectionHistory.query(query, (err, results) => {
      if (err) {
          console.error("Error fetching transactions:", err);
          return res.status(500).json({ error: "Database error." });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: "No transactions found." });
      }
      // console.log(results);
      

      // Send the response with the fetched results
      return res.status(200).json(results);
  });
};
exports.user_OutSendMoney = (req, res) => {
  const {senderNo} = req.body;
  
  // Your query to fetch data from the 'organazation_transection' table
  const query = `SELECT * FROM history_${senderNo}  where type = "Out Send Money" ORDER BY id DESC`;
  userTransectionHistory.query(query, (err, results) => {
      if (err) {
          console.error("Error fetching transactions:", err);
          return res.status(500).json({ error: "Database error." });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: "No transactions found." });
      }
      // console.log(results);
      

      // Send the response with the fetched results
      return res.status(200).json(results);
  });
};







exports.organazation_transection = (req, res) => {
  // Your query to fetch data from the 'organazation_transection' table
  const query = "SELECT * FROM organazation_transection ORDER BY id DESC";
  db.query(query, (err, results) => {
      if (err) {
          console.error("Error fetching transactions:", err);
          return res.status(500).json({ error: "Database error." });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: "No transactions found." });
      }
      // console.log(results);
      

      // Send the response with the fetched results
      return res.status(200).json(results);
  });
};
exports.withdraw_organazation_transection = (req, res) => {
  // Your query to fetch data from the 'organazation_transection' table
  const query = `SELECT * FROM organazation_transection  where type = "Agent Withdraw" ORDER BY id DESC`;
  db.query(query, (err, results) => {
      if (err) {
          console.error("Error fetching transactions:", err);
          return res.status(500).json({ error: "Database error." });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: "No transactions found." });
      }
      

      // Send the response with the fetched results
      return res.status(200).json(results);
  });
};
exports.sendmoney_organazation_transection = (req, res) => {
  // Your query to fetch data from the 'organazation_transection' table
  const query = `SELECT * FROM organazation_transection  where type = "Agent CashIn" ORDER BY id DESC`;
  db.query(query, (err, results) => {
      if (err) {
          console.error("Error fetching transactions:", err);
          return res.status(500).json({ error: "Database error." });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: "No transactions found." });
      }
      // console.log(results);
      

      // Send the response with the fetched results
      return res.status(200).json(results);
  });
};
exports.user_CashIn_organazation_transection = (req, res) => {
  // Your query to fetch data from the 'organazation_transection' table
  const query = `SELECT * FROM organazation_transection  where type = "user CashIn" ORDER BY id DESC`;
  db.query(query, (err, results) => {
      if (err) {
          console.error("Error fetching transactions:", err);
          return res.status(500).json({ error: "Database error." });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: "No transactions found." });
      }
      // console.log(results);
      

      // Send the response with the fetched results
      return res.status(200).json(results);
  });
};
exports.CashOut_organazation_transection = (req, res) => {
  // Your query to fetch data from the 'organazation_transection' table
  const query = `SELECT * FROM organazation_transection  where type = "Cash Out" ORDER BY id DESC`;
  db.query(query, (err, results) => {
      if (err) {
          console.error("Error fetching transactions:", err);
          return res.status(500).json({ error: "Database error." });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: "No transactions found." });
      }
      // console.log(results);
      

      // Send the response with the fetched results
      return res.status(200).json(results);
  });
};
exports.p2psendMoney_organazation_transection = (req, res) => {
  // Your query to fetch data from the 'organazation_transection' table
  const query = `SELECT * FROM organazation_transection  where type = "p2psendMoney" ORDER BY id DESC`;
  db.query(query, (err, results) => {
      if (err) {
          console.error("Error fetching transactions:", err);
          return res.status(500).json({ error: "Database error." });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: "No transactions found." });
      }
      // console.log(results);
      

      // Send the response with the fetched results
      return res.status(200).json(results);
  });
};




exports.agent_profit = (req, res) => {
  const {no} = req.body;
  // Your query to fetch data from the 'organazation_transection' table
  const query = `SELECT SUM(profit) as agent_profit FROM agent_${no}`;
  agentTransectionHistory.query(query, (err, results) => {
      if (err) {
          console.error("Error fetching transactions:", err);
          return res.status(500).json({ error: "Database error." });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: "No transactions found." });
      }
      // console.log(results);
      

      // Send the response with the fetched results
      return res.status(200).json(results[0]);
  });
};
exports.org_profit = (req, res) => {
  // Your query to fetch data from the 'organazation_transection' table
  const query = `SELECT SUM(profit) as org_profit FROM organazation_transection`;
    db.query(query, (err, results) => {
      if (err) {
          console.error("Error fetching transactions:", err);
          return res.status(500).json({ error: "Database error." });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: "No transactions found." });
      }
      // console.log(results);
      

      // Send the response with the fetched results
      return res.status(200).json(results[0]);
  });
};



exports.getAllUsers = (req, res) => {
  const query = "SELECT * FROM users";

  db.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching users:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error fetching users",
        error: error.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "All users fetched successfully",
      data: results,
    });
  });
};
exports.getAllAgent = (req, res) => {
  const query = "SELECT * FROM agent_users";

  db.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching users:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error fetching users",
        error: error.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "All users fetched successfully",
      data: results,
    });
  });
};




// SELECT balance FROM users WHERE no=2

// UPDATE company_balance SET company_balance = company_balance + balance WHERE ID = 1

// DELETE FROM users
// WHERE no=2;



// exports.delete_user = async (req, res) => {
//   const userNo = req.body; // Assuming user number is passed in the request parameters
//   console.log(userNo,"userNouserNo");
  
//   try {
//     // Start the transaction
//     await db.beginTransaction();

//     // Step 1: Get the user's balance
//     const [results] = await db.promise().query('SELECT balance FROM users WHERE no = ?', [userNo]);

//     if (results.length === 0) {
//       throw new Error('User not found');
//     }

//     const balance = results[0].balance;

//     // Step 2: Update the company balance
//     await db.promise().query('UPDATE company_balance SET company_balance = company_balance + ? WHERE ID = 1', [balance]);

//     // Step 3: Delete the user from the users table
//     await db.promise().query('DELETE FROM users WHERE no = ?', [userNo]);

//     // Commit the transaction if all queries are successful
//     await db.commit();
//     res.status(200).json({ success: true, message: 'User deleted and company balance updated successfully' });
//   } catch (error) {
//     // Rollback the transaction in case of error
//     await db.rollback();
//     res.status(500).json({ success: false, message: 'Error processing request', error: error.message });
//   }
// };

exports.delete_user = (req, res) => {
  const { no } = req.body;
  if (!no) {
    return res.status(400).json({ error: "Number is required." });
  }

  // Step 1: Get the user's balance
  const getBalanceQuery = "SELECT balance FROM users WHERE no = ?";
  db.query(getBalanceQuery, [no], (error, results) => {
    if (error) {
      console.error("Error fetching user balance:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error fetching user balance",
        error: error.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const balance = results[0].balance;

    // Step 2: Update the company balance
    const updateCompanyBalanceQuery = "UPDATE company_balance SET company_balance = company_balance + ? WHERE ID = 1";
    db.query(updateCompanyBalanceQuery, [balance], (error) => {
      if (error) {
        console.error("Error updating company balance:", error.message);
        return res.status(500).json({
          success: false,
          message: "Error updating company balance",
          error: error.message,
        });
      }

      // Step 3: Delete the user from the users table
      const deleteUserQuery = "DELETE FROM users WHERE no = ?";
      db.query(deleteUserQuery, [no], (error) => {
        if (error) {
          console.error("Error deleting user:", error.message);
          return res.status(500).json({
            success: false,
            message: "Error deleting user",
            error: error.message,
          });
        }

        const organazation_transection = `
              INSERT INTO organazation_transection (senderno,receiverno,amount,charge,profit,type) 
              VALUES (?, ?,?, ?,?,?)`;
            const transactionType = "User Deleted";
            
            db.query(organazation_transection, [ "Number--->",no,balance, 0,0 ,transactionType ], (err) => {
              if (err) {
                console.error("Error logging transaction:", err);
                return res.status(500).json({ error: "Transaction logging failed." });
              }


        res.status(200).json({
          success: true,
          message: "User deleted and company balance updated successfully",
        });
      });
      });
    });
  });
};
