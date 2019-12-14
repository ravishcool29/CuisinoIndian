const express = require('express');
const Datastore = require('nedb');
require('dotenv').config();

const port = process.env.PORT || 3001;
const app = express();
app.use(express.static('public'));
app.use(express.json());
app.listen(port, () => {console.log(`Listening at ${port}...`);});

const database = {};

/*====================================================================================================================================================*/
database.dishes = new Datastore('./warehouse/dishes.db');
database.dishes.loadDatabase(err => {
    if(err){
        console.log('Error Loading DISHES DB');
        console.error(err);
        return -1;
    }
    console.log('Dishes DB Loaded Succesfully!');
    return 0;
});
/*=======================================================TIMER=============================================================================================*/
database.session = new Datastore('./warehouse/session.db');
database.session.loadDatabase(err => {
    if(err){
        console.log('Error Loading SESSION DB');
        console.error(err);
        return -1;
    }
    console.log('Session DB Loaded Succesfully!');
    return 0;
});
database.reviews = new Datastore('./warehouse/reviews.db');
database.reviews.loadDatabase(err => {
    if(err){
        console.log('Error Loading REVIEWS DB');
        console.error(err);
        return -1;
    }
    console.log('Reviews DB Loaded Succesfully!');
    return 0;
});
/*=====================Sending Dishes for Menu==============================*/
app.get(`/dishes/:cuisine`, (request, response) => {
    const query = {cuisine: request.params.cuisine};
    database.dishes.find(query, (err, docs) => {
        if(err || docs.length == 0){
            console.log(err);
            response.json({
                status: 'failed',
                error: err
            });
            return;
        }
        //console.log(docs.length);
        response.json(docs);
    });
});
app.get(`/menuDishRequest/:id/:dishId`, (request, response) => {
    const dishId = request.params.dishId;
    const username = request.params.id;
    //console.log(dishId);
    database.session.update({_id: username}, {$set: {_dishId: dishId}}, {upsert:true}, (err, numAffected, docs, upsert) => {
        if(err){
            console.error(err);
            response.json({success: false});
            return;
        }
        //console.log(docs);
        //console.log(numAffected);
        //console.log(upsert);
        response.json({success: true});
    });
});
app.get('/dishReq/:id', (request, response) => {
    database.session.find({_id: request.params.id}, (err, docs) => {
        if(err){
            console.error(err);
            response.end();
            return;
        }
        //console.log(docs[0].dishId);
        response.json(docs[0]._dishId);
    });
});
app.get('/dishDetail/:dishId', (request, response) => {
    database.dishes.find({_id: request.params.dishId}, (err, doc) => {
        if(err){
            console.error(err);
            response.json();
            return;
        }
        //console.log(doc[0]);
        response.json(doc[0]);
    });
});
app.get('/addToCart/:id/:dishId/:qty', (request, response) => {
    const dishId = request.params.dishId;
    const quantity = Number(request.params.qty);
    const id = request.params.id;
    //console.log(`${id} ${quantity} ${dishId}`);

    database.session.update({_userId: id, dishId: dishId}, {$set: {quantity: quantity}}, {upsert: "true"}, (err, numAffected, docs, upsert) => {
        if(err){
            console.error(err);
            response.json({success: false});
            return;
        }
        //console.log(docs);
        //console.log(numAffected);
        if(upsert)
            response.json({
                success: true,
                exists: false
            });
        else
            response.json({
                success: true,
                exists: true
            });
    });
});
app.get('/itemExistsInCart/:id/:dishId', (request, response) => {
    console.log(request.params);
    database.session.find({_userId: request.params.id, dishId: request.params.dishId}, (err, docs) => {
        if(err){
            console.error(err);
            response.json({success: false});
            return;
        }
        console.log(docs.length);
        if(docs.length)
            response.json({success: true, exists: true});
        else
            response.json({success: true, exists: false});
    });
});
app.get('/cartItems/:id', (request, response) => {
    const id = request.params.id;

    database.session.find({_userId: id}, {dishId: 1, quantity:1}, (err, docs) => {
        if(err){
            console.error(err);
            response.end();
            return;
        }
        response.json(docs);
    });
});
app.get('/changeQty/:id/:qty', (request, response) => {
    const quantity = Number(request.params.qty);
    const id = request.params.id;
    console.log(`${id} ${quantity}`);

    database.session.update({dishId: id}, {$set: {quantity: quantity}}, (err, numAffected, docs, upsert) => {
        if(err){
            console.error(err);
            response.json({success: false});
            return;
        }
        //console.log(docs);
        console.log(numAffected);
        //console.log(upsert);
        response.json({success: true});
    });
});
app.get('/removeItemCart/:id', (request, response) => {
    //console.log(request.params.id);
    database.session.remove({dishId: request.params.id}, (err, enteriesRemoved) => {
        if(err){
            console.error(err);
            response.json({
                success: false
            });
            return;
        }
        console.log(enteriesRemoved);
        response.json({
            success: true
        });
    });
});
app.get('/priceUpdate/:id/:total', (request, response) => {
    database.session.update({_id: request.params.id}, {$set: {totalPrice: request.params.total}}, (err, numAffected, docs, upsert) => {
        if (err)
            console.error(err);
        response.end();
    });
});
app.get('/reviews/:dishId', (request,response) => {
    console.log(request.params.dishId);
    database.reviews.find({dishId: request.params.dishId}, (err, docs) => {
        if(err){
            console.error(err);
            response.end();
            return;
        }
        //console.log(docs);
        response.json(docs);
    });
});
app.post('/ratingUpdate', async (request, response) => {
    const ratings = request.body;
    var errFlag = await false;
    for(rating of ratings){
        //console.log(Number(rating.rating));
        database.dishes.update({_id: rating.dishId}, {$inc: {"rating.total": Number(rating.rating), "rating.user_count": 1}}, (err, numAffected, docs, upsert) => {
            if(err){
                console.error(err);
                errFlag = true
                return;
            }
            //console.log(docs);
            //console.log(numAffected);
            //console.log(upsert);
            //response.json({success: true});
        });
    }
    if(errFlag)
        response.json({success: false});
    else
        response.json({success: true});
});
app.post('/postReviews', async (request, response) => {
    const reviews = request.body;
    var errFlag = await false;
    for(review of reviews){
        //console.log(review);
        database.reviews.insert(review, (err, docs) => {
            if(err){
                console.error(err);
                errFlag = true;
                return;
            }
            //console.log(docs);
            //response.json({success: true});
        });
    }
    if(errFlag)
        response.json({success: false});
    else
        response.json({success: true});
});
app.post('/saveUserInfo', (request, response) => {
    console.log(request.body);
    database.session.insert(request.body, (err, docs) => {
        if(err){
            console.error(err);
            response.json({success: false});
            return;
        }
        response.json({success: true, id: docs._id});
    })
});
app.get('/userAttribute/:id/:attr', (request, response) => {
    const attr = request.params.attr;

    if(attr === 'name'){
        database.session.find({_id: request.params.id}, {name: 1, _id: 0}, (err, docs) => {
            if(err){
                console.error(err);
                response.json({success: false});
                return;
            }
            console.log({success: true, name: docs[0].name});
            response.json({success: true, name: docs[0].name});
        });
    }
    else if(attr === 'email'){
        database.session.find({_id: request.params.id}, {email: 1, _id: 0}, (err, docs) => {
            if(err){
                console.error(err);
                response.json({success: false});
                return;
            }
            console.log({success: true, email: docs[0].email});
            response.json({success: true, email: docs[0].email});
        });
    }
    else if(attr === 'phone'){
        database.session.find({_id: request.params.id}, {phone: 1, _id: 0}, (err, docs) => {
            if(err){
                console.error(err);
                response.json({success: false});
                return;
            }
            console.log({success: true, phone: docs[0].phone});
            response.json({success: true, phone: docs[0].phone});
        });
    }
    else if(attr === 'guests'){
        database.session.find({_id: request.params.id}, {guests: 1, _id: 0}, (err, docs) => {
            if(err){
                console.error(err);
                response.json({success: false});
                return;
            }
            console.log({success: true, guests: docs[0].guests});
            response.json({success: true, guests: docs[0].guests});
        });
    }
    else if(attr === 'seconds'){
        database.session.find({_id: request.params.id}, {seconds: 1, _id: 0}, (err, docs) => {
            if(err){
                console.error(err);
                response.json({success: false});
                return;
            }
            console.log({success: true, seconds: docs[0].seconds});
            response.json({success: true, seconds: docs[0].seconds});
        });
    }
    else if(attr === 'totalPrice'){
        database.session.find({_id: request.params.id}, {totalPrice: 1, _id: 0}, (err, docs) => {
            if(err){
                console.error(err);
                response.json({success: false});
                return;
            }
            console.log({success: true, totalPrice: docs[0].totalPrice});
            response.json({success: true, totalPrice: docs[0].totalPrice});
        });
    }
    else if(attr === 'time'){
        database.session.find({_id: request.params.id}, {time: 1, _id: 0}, (err, docs) => {
            if(err){
                console.error(err);
                response.json({success: false});
                return;
            }
            console.log({success: true, time: docs[0].time});
            response.json({success: true, time: docs[0].time});
        });
    }
    else
        response.json({success: false});
});
app.get('/updateSeconds/:id/:seconds', (request, response) => {
    //console.log(request.params.seconds);
    database.session.update({_id: request.params.id}, {$set: {seconds: request.params.seconds}}, (err, docs) => {
        if(err){
            console.error(err);
        }
        //console.log({success: true, seconds: docs.seconds});
        response.end();
    });
});
app.get('/removeUser/:id', (request, response) => {
    //console.log(request.params.seconds);
    database.session.remove({_id: request.params.id}, (err, enteriesRemoved) => {
        if(err){
            console.error(err);
            response.json({
                success: false
            });
            return;
        }
        console.log(enteriesRemoved);
        response.json({
            success: true
        });
    });
});
app.get('itemExistsInCart/:id/:dishId', (request, response) => {
    database.session.find({_userid})
});
app.get('/removeUserEntities/:id', (request, response) => {
    database.session.remove({_userId: request.params.id}, {multi: true}, (err, enteriesRemoved) => {
        if(err){
            console.error(err);
            response.json({
                success: false
            });
            return;
        }
        response.json({
            success: true
        });
    });
});
