import express, { json } from 'express';
import level from 'level';
import api from './externalApi'

const app = express();

const db = new level.Level('./db', {valueEncoding: 'json'})

app.use(json())

const PORT= 3000;

app.listen(PORT, () => console.log(`App listening at port ${PORT}`));

app.get('/', async (req, res) => {
  res.json({ status: true, message: "Our API is UP!" })
});

app.get('/activity', async (req, res) => {
  let user;
  try {
    user = await db.get('user')
  } catch (e) {
    console.log('No user in DB');
  }

  let response;
  let responseCanBeSent = !user;
  do {
    const externalApiResponse = await api.getActivity();
    console.log('externalApiResponse', externalApiResponse);

    if(externalApiResponse) {
      let mappedPrice;
      if (externalApiResponse.price > 0.5) {
        mappedPrice = 'High';
      } else if (externalApiResponse.price === 0) {
        mappedPrice = 'Free';
      } else {
        mappedPrice = 'Low';
      }

      let mappedAccessibility;
      if (externalApiResponse.accessibility <= 0.25) {
        mappedAccessibility = 'High';
      } else if (externalApiResponse.accessibility > 0.75) {
        mappedAccessibility = 'Low';
      } else {
        mappedAccessibility = 'Medium';
      }

      response = {...externalApiResponse, price: mappedPrice, accessibility: mappedAccessibility}
    } else{
      return res.status(400).send({message: 'Something went wrong with the external api'})
    }
    if(user && response.price === user.price && response.accessibility === user.accessibility){
      responseCanBeSent = true;
    }
  } while(!responseCanBeSent)
  return res.status(200).send(response)
});

app.post('/user', async (req, res) => {
  const { name, accessibility, price } = req.body;

  await db.put('user', {name, accessibility, price}, (err)=> {
    if(err){
      return res.status(400).send({message: 'The following went wrong while saving user to DB: ' + err})
    }
  })

  return res.status(200).send({message: 'User saved successfully'});
})

app.get('/getUser', async (req, res) => {
  await db.get('user', (err, user) => {
    if(err){
      return res.status(400).send({message: 'The following went wrong while fetching user to DB: ' + err})
    }

    return res.status(200).send(user)
  })
})

app.delete('/deleteUser', async(req, res) => {
  await db.del('user', (err) => {
    if(err){
      return res.status(400).send({message: 'The following went wrong while deleting user from DB: ' + err})
    }

    return res.status(200).send({message: 'User successfully deleted'})
  })
})

