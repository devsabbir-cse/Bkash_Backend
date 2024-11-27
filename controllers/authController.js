const db = require("../db/connection");

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

      res.status(201).json({ message: "User registered successfully!" });
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

      res.status(201).json({ message: "User registered successfully!" });
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
// Function to handle transactions (Send Money, Cashout, Payment, Recharge)
exports.handleTransaction = (req, res) => {
  const { senderNo, receiverNo, amount, transactionType } = req.body;

  if (!senderNo || !receiverNo || !amount || !transactionType) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Query to check if sender exists
  const checkSenderQuery = "SELECT * FROM users WHERE no = ?";
  db.query(checkSenderQuery, [senderNo], (err, senderResults) => {
    if (err || senderResults.length === 0) {
      console.error("Error finding sender:", err || "Sender not found.");
      return res.status(404).json({ error: "Sender not found." });
    }

    // Query to check if receiver exists
    const checkReceiverQuery = "SELECT * FROM users WHERE no = ?";
    db.query(checkReceiverQuery, [receiverNo], (err, receiverResults) => {
      if (err || receiverResults.length === 0) {
        console.error("Error finding receiver:", err || "Receiver not found.");
        return res.status(404).json({ error: "Receiver not found." });
      }

      // Validate sender balance
      if (senderResults[0].balance < amount) {
        return res.status(400).json({ error: "Insufficient balance." });
      }

      // Update balances: deduct from sender, add to receiver
      const updateSenderQuery = "UPDATE users SET balance = balance - ? WHERE no = ?";
      const updateReceiverQuery = "UPDATE users SET balance = balance + ? WHERE no = ?";
      
      db.query(updateSenderQuery, [amount, senderNo], (err) => {
        if (err) {
          console.error("Error deducting from sender:", err);
          return res.status(500).json({ error: "Transaction failed." });
        }

        db.query(updateReceiverQuery, [amount, receiverNo], (err) => {
          if (err) {
            console.error("Error adding to receiver:", err);
            return res.status(500).json({ error: "Transaction failed." });
          }

          // Log the transaction
          const logTransactionQuery = `
            INSERT INTO transactions (sender_no, receiver_no, transaction_type, amount, description) 
            VALUES (?, ?, ?, ?, ?)`;
          const description = `${transactionType} of ${amount}`;
          db.query(logTransactionQuery, [senderNo, receiverNo, transactionType, amount, description], (err) => {
            if (err) {
              console.error("Error logging transaction:", err);
              return res.status(500).json({ error: "Transaction logging failed." });
            }

            return res.status(200).json({ message: `${description} was successful.` });
          });
        });
      });
    });
  });
};
exports.showBalance = (req, res) => {
  const { no } = req.body;  // Mobile number from the request body

  if (!no) {
    return res.status(400).json({ error: "Mobile number is required." });
  }

  const query = "SELECT balance FROM users WHERE no = ?";
  
  db.query(query, [no], (err, results) => {
    if (err) {
      console.error("Error fetching balance:", err);
      return res.status(500).json({ error: "Internal server error." });
    }

    if (results.length > 0) {
      // Assuming balance is stored in the `balance` column
      const balance = results[0].balance;
      res.status(200).json({ balance });
    } else {
      res.status(404).json({ error: "User not found." });
    }
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
            INSERT INTO transactions (sender_no, receiver_no, transaction_type, amount, description) 
            VALUES (?, ?, ?, ?, ?)`;
          const transactionType = "Send Money";
          const description = `${transactionType} of $${amount}`;
          
          db.query(logTransactionQuery, [senderNo, receiverNo, transactionType, amount, description], (err) => {
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
};
exports.Cashout = (req, res) => {
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
      const updateReceiverQuery = "UPDATE agent_users SET balance = balance + ? WHERE no = ?";
      
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
            INSERT INTO transactions (sender_no, receiver_no, transaction_type, amount, description) 
            VALUES (?, ?, ?, ?, ?)`;
          const transactionType = "Cash Out";
          const description = `${transactionType} of $${amount}`;
          
          db.query(logTransactionQuery, [senderNo, receiverNo, transactionType, amount, description], (err) => {
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
};







