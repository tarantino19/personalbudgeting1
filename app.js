const express = require('express');
const app = express();
const fs = require ('fs');
var envelopes = JSON.parse(fs.readFileSync('./data/envelopes.json'));
app.use(express.json()) //for getting req.body req params 


//get envelopes
app.get ('/api/v1/envelopes', (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      envelopes: envelopes
    }
  });
});

//get specific envelope
app.get ('/api/v1/envelope/:id', (req, res) => {
  const id = +req.params.id
  const oneEnvelope = envelopes.find(env => env.id === id);

  if (!oneEnvelope) {
    return res.status(404).json({
      status: "failed request",
      message: `envelope with id of ${id} not found`
    })
  } else {
    res.status(200).json({
      status:"success",
      data: {
        envelopes: oneEnvelope
      }
    })
  };
});

//create an envelope
app.post ('/api/v1/envelopes', (req, res) => {
  const newEnvelope = req.body;
  const newId = envelopes[envelopes.length -1].id + 1;
  const updatedEnvelope = Object.assign({id: newId}, newEnvelope)

  envelopes.push(updatedEnvelope) 

  //Updating the database and sending json as response
  fs.writeFile('./data/envelopes.json', JSON.stringify (envelopes), () => {
      res.status (201).json({
        status: "success",
        data: {
            envelopes: newEnvelope
        }
      });
  });
});

//update an envelope
app.patch ('/api/v1/envelope/:id', (req, res) => {
  const id = +req.params.id;
  const envelopeToUpdate = envelopes.find(env => env.id === id);

  if (!envelopeToUpdate) {
    return res.status(404).json ({ 
      status: "fail",
      message: `There's no envelope with an id of ${id}`
    })
  } else {
    const updatedEnvelopeDetails = Object.assign(envelopeToUpdate, req.body)

    fs.writeFile ('./data/envelopes.json', JSON.stringify (envelopes), () => {
      res.status (200).json({
        status: "success",
        data: {
            envelopes: updatedEnvelopeDetails
        }
      });
  });
  }
});

//delete an envelope
app.delete ('/api/v1/envelope/:id', (req, res)=> {
  const id = +req.params.id;
  const envelopeIdToDelete = envelopes.find(env => env.id === id);

  if (!envelopeIdToDelete){
    return res.status(404).json ({  
      status: "fail",
      message: `There's no envelope with an id of ${id} or this resource has already been deleted`
    })

  }  else {
    const index = envelopes.indexOf(envelopeIdToDelete)
    envelopes.splice(index, 1)

  fs.writeFile('./data/envelopes.json', JSON.stringify(envelopes), () => {
    res.status(204).json({
        status: "success",
        data: {
            envelope: null
        }
    })
})
  };
});

//transfer
app.patch ('/api/v1/transfer/:from/:to', (req, res) => {
  const idOfFrom = +req.params.from;
  const idOfTo = +req.params.to;

  const amount = req.body.amount;
  const fromEnvelope = envelopes.find(env => env.id === idOfFrom)
  const toEnvelope = envelopes.find(env => env.id === idOfTo)
  

  //transferring of amount
  if (fromEnvelope.amount < amount) {
    return res.status(503).send('Not enough funds in the source account')
  } else {
    const updatedFromEnvelope = {...fromEnvelope, amount: fromEnvelope.amount - amount}  
    // fromEvelope.amount -> database
    //amount - userinput || req.body
    const updatedToEnvelope = {...toEnvelope, amount: toEnvelope.amount + amount} 
    
    // envelopes = envelopes.map(env => (env.id === idOfFrom ? updatedFromEnvelope : env.id === idOfTo ? updatedToEnvelope : env));
    //here we're just updating the original envelopes value - there's data mutation here
    envelopes = envelopes.map(env => {
      if (env.id === idOfFrom) {
        return updatedFromEnvelope;
      } else if (env.id === idOfTo) {
        return updatedToEnvelope;
      } else {
        return env;
      }
    });


  fs.writeFile('./data/envelopes.json', JSON.stringify(envelopes, null, 2), ()=> {
    res.status(200).json ({
      message:"Transfer successful!",
      data: envelopes
    })
  });
  }
});

// unang validation diyan if(amount > fromBudget.amount){
//   res.status(500).json({message:"walang pera")}
// tas else mo 
// updatedToBudget ={...toBudget , amount: tobduget.amount + amount}
// updatedFromBudget = {...fromBudget , amount: fromBudget.amount- amount}

const PORT = 3000
app.listen (PORT, () => {
  console.log(`Listening to server ${PORT}`)
});