//Landing Page User Credentials
async function userCredValidate(){        ///Validation and
    const username = document.getElementById('usernameUserCred').value;
    const email = document.getElementById("emailUserCred").value;
    const phnum = document.getElementById("phnumUserCred").value;
    var flag=true;
    if(username === ''){
        flag=false;
        document.getElementsByClassName('error')[0].style.display = "block";
        document.getElementsByClassName('error-message')[0].style.display = "block";
    }
    if(!(/^[A-Z0-9.%-+_]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email))){
        flag=false;
        document.getElementsByClassName('error')[1].style.display = "block";
        document.getElementsByClassName('error-message')[1].style.display = "block";
    }
    if(!Number(phnum) || phnum.length!=10){
        flag=false;
        document.getElementsByClassName('error')[2].style.display = "block";
        document.getElementsByClassName('error-message')[2].style.display = "block";
    }
    if(flag){
        const guests = document.getElementById("guestsUserCred").value;
        const seconds = document.getElementById("secondsUserCred").value;
        //console.log(`${username} ${email} ${phnum} ${guests} ${seconds}`);
        const info = {
            name: username,
            email: email,
            phone: phnum,
            guests: guests,
            time: seconds,
            seconds: seconds,
            totalPrice: 0.00
        };
        const response = await fetch('/saveUserInfo', {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(info)
        });
        const success = await response.json();
        if(success.success){
            window.location.href = './home.html';
            window.localStorage.setItem('_userid_', success.id);
            window.localStorage.setItem('_seconds_', seconds)
        }
    }
}
function adjustIcon(index, events){
    var icon = document.getElementsByClassName('field-icon')[index];
    if(events == 1){
        icon.style.transform = 'translateX(-5px)';
        icon.style.color = '#00baff';
        document.getElementsByClassName('error')[index].style.display = "none";
        document.getElementsByClassName('error-message')[index].style.display = "none";
        return;
    }
    icon.style.transform = 'translateX(0)';
    icon.style.color = 'black';
}
//Calling Timer function for selected user duration
async function callTimerFunction(){
    const response = await fetch(`/userAttribute/${window.localStorage.getItem('_userid_')}/seconds`);
    const data = await response.json();
    if(data.success){
        //console.log(data.seconds);
        const secs = window.localStorage.getItem('_seconds_');
        if(secs)
            startTimer(secs);
        else{
            startTimer(data.seconds);
            window.localStorage.setItem('_seconds_', data.seconds);
        }
    }
}
//Timer function Definition
async function startTimer(seconds){
    var hrs = Math.ceil((seconds)/3600)-1;
    var mins = (Math.floor((seconds-1)/60))%60;
    var secs = (seconds-1)%60;

    if(hrs == -1 && mins == -1 && secs == -1){      //Exit Block
        window.localStorage.setItem('_checkout_', true);
        if (page_url.substring(page_url.lastIndexOf('/')+1) != 'checkout.html') {
            window.location.href = './checkout.html';
        }
        return;
    }

    if(hrs > 9)
        document.getElementById('hrs').innerText = hrs;
    else
        document.getElementById('hrs').innerText = "0"+(hrs);

    if(mins > 9)
        document.getElementById('mins').innerText = mins;
    else
        document.getElementById('mins').innerText = "0"+(mins);
    if(secs > 9)
        document.getElementById('secs').innerText = secs;
    else
        document.getElementById('secs').innerText = "0"+(secs);
    window.localStorage.setItem('_seconds_', seconds-1);
    if(secs == 0){
        const response = await fetch(`/updateSeconds/${window.localStorage.getItem('_userid_')}/${seconds}`);
    }
    await setTimeout(startTimer, 1000, --seconds);        //Recursively calling and decrementing seconds after every 1000 milliseconds
}

//Navigation Menu Code
const navMenu = document.getElementById('navigation-menu');
const line1 = document.getElementById('line1');
const line2 = document.getElementById('line2');
const line3 = document.getElementById('line3');
const hamburger = document.getElementById('hamburger');
hamburger.addEventListener('click', () => {
    if(!navMenu.classList.contains('active-menu')){
        navMenu.classList.add('active-menu');
        line1.style.transform = "translateY(220%) rotateZ(45deg)";
        line2.style.opacity = '0';
        line3.style.transform = "translateY(-220%) rotateZ(-45deg)";
        hamburger.style.position = 'fixed';
        hamburger.style.top = '97px';
    }
    else{
        navMenu.classList.remove('active-menu');
        line1.style.transform = "translateY(0) rotateZ(0)";
        line2.style.opacity = '1';
        line3.style.transform = "translateY(0) rotateZ(0)";
        hamburger.style.position = 'absolute';
        hamburger.style.top = '23px'
    }
});

//Fetch Menu from database
async function fetchDishes(cuisine){
    const response = await fetch(`/dishes/${cuisine}`);
    const dishes = await response.json();
    //console.log(dishes);

    const root = document.getElementById(cuisine);
    for(dish of dishes){
        const menu_item = document.createElement('div');
        menu_item.classList.add('menu-item');

        const img = document.createElement('img');
        img.src = dish.image;
        img.alt = dish.name;

        const menu_item_info = document.createElement('div');
        menu_item_info.classList.add('menu-item-info');

        const dishName = document.createElement('h4');
        dishName.align = "center";
        dishName.classList.add('col-12');
        dishName.innerText = dish.name;

        const rupee = document.createElement('i');
        rupee.classList.add('fa');
        rupee.classList.add('fa-inr');

        const priceSpan = document.createElement('span');
        priceSpan.innerText = dish.price;

        const dishPrice = document.createElement('h4');
        dishPrice.align = "center";
        dishPrice.classList.add('col-12');
        dishPrice.append(rupee, priceSpan);

        const star = document.createElement('i');
        star.classList.add('fa');
        star.classList.add('fa-star');
        star.classList.add('text-warning');

        const badge = document.createElement('span');
        badge.classList.add('badge');
        badge.classList.add('badge-success');
        badge.innerText = ((dish.rating.total/dish.rating.user_count).toFixed(1));
        badge.append(star);

        const dishRating = document.createElement('h6');
        dishRating.align = "center";
        dishRating.append(badge);

        const viewDetails = document.createElement('h5');
        viewDetails.align = "center";
        viewDetails.classList.add('col-10');
        viewDetails.classList.add('mx-auto');
        viewDetails.classList.add('view-details');
        viewDetails.innerText = 'View Details >';

        const dishId = dish._id;
        viewDetails.addEventListener('click', async function(){
            const response = await fetch(`/menuDishRequest/${window.localStorage.getItem('_userid_')}/${dishId}`);
            const status = await response.json();
            if(status.success)
                window.location.href = './dishDetail.html';
        });

        menu_item_info.append(dishName, dishPrice, dishRating, viewDetails);
        menu_item.append(img, menu_item_info);
        root.append(menu_item);
    }
}
//---------------------------Dish Detail---------------------------------------------------
//Loading Reviews
async function loadReviews(dishId){
    const response = await fetch(`/reviews/${dishId}`);
    const reviews = await response.json();

    for(review of reviews){
        const root = document.createElement('div');
        root.classList.add('review');

        const user_img = document.createElement('img');
        user_img.src = './img/user_icon.jpg';
        user_img.alt = review.author;
        user_img.classList.add('review-img');

        const username_rating_date = document.createElement('div');
        username_rating_date.classList.add('review-username');
        username_rating_date.innerHTML = `<p>${review.author}</p>
        <span class="badge badge-success">${review.rating} <i class="fa fa-star text-warning"></i></span>
        <span class="ml-2">${new Date(review.timestamp).toDateString()}</span>`;

        const review_body = document.createElement('div');
        review_body.classList.add('review-body');

        const review_comment = document.createElement('p');
        review_comment.innerText = review.comment;

        review_body.append(review_comment);
        root.append(user_img, username_rating_date, review_body);
        document.getElementById('reviewDiv').append(root);
    }
}
//Load Dish Details
async function loadDish(){
    const response1 = await fetch(`/dishReq/${window.localStorage.getItem('_userid_')}`);
    const dishId = await response1.json();
    //console.log(dish);
    const response2 = await fetch(`/dishDetail/${dishId}`);
    const dish = await response2.json();

    const dishImg = document.getElementById('dishImg');
    dishImg.src = dish.image;
    dishImg.alt = dish.name;

    document.getElementById('dishPrice').innerText = dish.price;
    document.getElementById('dishRating').innerText = ((dish.rating.total/dish.rating.user_count).toFixed(1));
    document.getElementById('dishRegion').innerText = dish.cuisine.toUpperCase();
    document.getElementById('dishName').innerText = dish.name;
    document.getElementById('dishDescription').innerText = dish.description;
    loadReviews(dishId).catch(err => {
        window.alert("Error Loading Reviews")
        console.error(err);
    });
    /*if(dish){
        document.getElementById('loadingDiv').style.display = "none";
    }*/
    const addToCart = document.getElementById('addToCart');
    const resp = await fetch(`/itemExistsInCart/${window.localStorage.getItem('_userid_')}/${dishId}`);
    const exists = await resp.json();
    //console.log(exists);
    if(exists.success){
        if(exists.exists){
            addToCart.innerHTML = `<span class="fa fa-shopping-cart"></span> <b>Go To Cart</b>`;
        }
    }

    addToCart.addEventListener('click', async () => {
        console.log(document.getElementById('dishQty').innerText);
        let qty = document.getElementById('dishQty').innerText;

        const resp = await fetch(`/itemExistsInCart/${window.localStorage.getItem('_userid_')}/${dishId}`);
        const exists = await resp.json();
        if(exists.success){
            if(exists.exists)
                window.location.href = './cart.html';
            else{
                const response = await fetch(`/addToCart/${window.localStorage.getItem('_userid_')}/${dish._id}/${qty}`);
                const success = await response.json();

                //console.log(success);
                if(success.success){
                    addToCart.innerHTML = `<span class="fa fa-shopping-cart"></span> <b>Go To Cart</b>`;
                    //window.alert(`Item Added To Cart\nQuantity: ${qty}`);
                    cartValueUpdate();
                }
            }
        }
    });
}

//=============================================Rendering Cart Items===============================================
async function renderCartItems(){
    //const dish = {"category":"maincourse","cuisine":"chinese","_id":"ch01","name":"Kung Pao Chicken","price":459,"description":"Spicy chicken with peanuts, similar to what is served in Chinese restaurants. It is easy to make, and you can be as sloppy with the measurements as you want. They reduce to a nice, thick sauce. Substitute cashews for peanuts, or bamboo shoots for the water chestnuts. You can't go wrong! Enjoy!","image":"./img/Kung-Pao-Chicken.jpg","rating":{"total":37,"user_count":10}};
    const response = await fetch(`/cartItems/${window.localStorage.getItem('_userid_')}`);
    const dishIds = await response.json();
    const cartList = document.getElementById('cartList');

    if(dishIds.length){
        cartList.innerHTML = ``;
        for(dishId of dishIds){
            const res = await fetch(`/dishDetail/${dishId.dishId}`);
            const dish = await res.json();

            const root = document.createElement('div');
            root.classList.add('row');
            root.classList.add('p-3');
            root.classList.add('cart-items-main-div');
            root.style.width = "100%";
            root.setAttribute('dish-id', dishId.dishId);
            root.setAttribute('price', dish.price);

            const cart_item_lhs = document.createElement('div');
            cart_item_lhs.classList.add('cart-item-lhs');
            cart_item_lhs.classList.add('col-md-4');
            cart_item_lhs.classList.add('col-12');

            const cart_img_div = document.createElement('div');
            cart_img_div.classList.add('row');
            cart_img_div.classList.add('h-75');
            cart_img_div.classList.add('cart-img-div');

            const cart_img_innerdiv = document.createElement('div');
            cart_img_innerdiv.classList.add('cart-img-innerdiv');

            const cart_img_innerdiv_img = document.createElement('img');
            cart_img_innerdiv_img.src = dish.image;
            cart_img_innerdiv_img.alt = dish.name;

            cart_img_innerdiv.append(cart_img_innerdiv_img)
            cart_img_div.append(cart_img_innerdiv);

            const qty_inc_dec_outer_div = document.createElement('div');
            qty_inc_dec_outer_div.classList.add('row');
            qty_inc_dec_outer_div.classList.add('h-25');

            const qty_inc_dec_inner_div = document.createElement('div');
            qty_inc_dec_inner_div.classList.add('col-12');
            qty_inc_dec_inner_div.align = "center";

            const dishQty = document.createElement('span');
            dishQty.classList.add('m-2');
            dishQty.innerText = dishId.quantity;
            dishQty.style.fontWeight = 'bold';

            const dishQtyDec = document.createElement('span');
            dishQtyDec.innerHTML = `<i class="fa fa-minus"></i>`;
            dishQtyDec.addEventListener('click', async () => {
                if(Number(dishQty.innerText) > 1){
                    dishQty.innerText = Number(dishQty.innerText)-1;
                    let id = root.getAttribute('dish-id');
                    let price = root.getAttribute('price');
                    const response = await fetch(`/changeQty/${id}/${dishQty.innerText}`);
                    const success = await response.json();
                    if(success.success){
                        cart_item_rhs_innerdiv.innerHTML = `<h5>${dish.name} <span class="badge badge-success"><span id="dishRating">${(dish.rating.total/dish.rating.user_count).toFixed(1)}</span> <i class="fa fa-star text-warning"></i></span>
                        <span class="badge badge-danger">${dish.cuisine.toUpperCase()}</span></h5>
                        <h5><i class="fa fa-inr"></i>${price*Number(dishQty.innerText)}</h5>`;
                        await priceDetailsUpdate();
                    }
                }
            });

            const dishQtyInc = document.createElement('span');
            dishQtyInc.innerHTML = `<i class="fa fa-plus"></i>`;
            dishQtyInc.addEventListener('click', async () => {
                if(Number(dishQty.innerText) < 6){
                    dishQty.innerText = Number(dishQty.innerText)+1;
                    let id = root.getAttribute('dish-id');
                    let price = root.getAttribute('price');
                    const response = await fetch(`/changeQty/${id}/${dishQty.innerText}`);
                    const success = await response.json();
                    if(success.success){
                        cart_item_rhs_innerdiv.innerHTML = `<h5>${dish.name} <span class="badge badge-success"><span id="dishRating">${(dish.rating.total/dish.rating.user_count).toFixed(1)}</span> <i class="fa fa-star text-warning"></i></span>
                        <span class="badge badge-danger">${dish.cuisine.toUpperCase()}</span></h5>
                        <h5><i class="fa fa-inr"></i>${price*Number(dishQty.innerText)}</h5>`;
                        await priceDetailsUpdate();
                    }
                }
            });

            qty_inc_dec_inner_div.append(dishQtyDec, dishQty, dishQtyInc)
            qty_inc_dec_outer_div.append(qty_inc_dec_inner_div);

            cart_item_lhs.append(cart_img_div, qty_inc_dec_outer_div)

            const cart_item_rhs = document.createElement('div');
            cart_item_rhs.classList.add('cart-item-rhs');
            cart_item_rhs.classList.add('col-md-8');
            cart_item_rhs.classList.add('col-12');

            const cart_item_rhs_innerdiv = document.createElement('div');
            cart_item_rhs_innerdiv.classList.add('h-75');
            cart_item_rhs_innerdiv.innerHTML = `<h5>${dish.name} <span class="badge badge-success"><span id="dishRating">${(dish.rating.total/dish.rating.user_count).toFixed(1)}</span> <i class="fa fa-star text-warning"></i></span>
            <span class="badge badge-danger">${dish.cuisine.toUpperCase()}</span></h5>
            <h5><i class="fa fa-inr"></i>${dish.price*dishId.quantity}</h5>`;

            const cart_item_rhs_btndiv = document.createElement('div');
            cart_item_rhs_btndiv.classList.add('h-25');

            const remove_btn = document.createElement('span');
            remove_btn.classList.add('cart-remove-btn');
            remove_btn.setAttribute('role', "button");
            remove_btn.innerText = "Remove";
            remove_btn.addEventListener('click', async () => {
                let id = root.getAttribute('dish-id');
                //console.log('Remove');
                if(window.confirm("You Want to Remove This Item From Cart")){
                    const response = await fetch(`/removeItemCart/${id}`);
                    const success = await response.json();
                    if(success.success){
                        cartList.removeChild(root);
                        if(cartList.childNodes.length === 0)
                            cartList.innerHTML = `<div class="row m-0 justify-content-center align-content-center mt-5" style="height: 400px; width: 100%;">
                                <div class="col-12" align="center">
                                    <img src="./img/box.png" alt="EMPTY">
                                </div>
                                <div class="row m-0 mt-2 mx-auto">
                                    <div class="col-12 mx-auto">
                                        <a role="button" href="./menu.html" class="col-auto btn btn-primary">Add Items to Cart</a>
                                    </div>
                                </div>
                            </div>`;
                        cartValueUpdate();
                        await priceDetailsUpdate();
                    }
                }
            });

            cart_item_rhs_btndiv.append(remove_btn);
            cart_item_rhs.append(cart_item_rhs_innerdiv, cart_item_rhs_btndiv);
            root.append(cart_item_lhs, cart_item_rhs);

            cartList.append(root);
        }
        await priceDetailsUpdate();
    }
    else{
        cartList.innerHTML = `<div class="row m-0 justify-content-center align-content-center mt-5" style="height: 400px; width: 100%;">
            <div class="col-12" align="center">
                <img src="./img/box.png" alt="EMPTY">
            </div>
            <div class="row m-0 mt-2 mx-auto">
                <div class="col-12 mx-auto">
                    <a role="button" href="./menu.html" class="col-auto btn btn-primary">Add Items to Cart</a>
                </div>
            </div>
        </div>`;
    }
}
///Updating Cart Value in Nav Bar
async function cartValueUpdate(){
    const response = await fetch(`/cartItems/${window.localStorage.getItem('_userid_')}`);
    const dishIds = await response.json();
    document.getElementById('cart-value').innerText = dishIds.length;
}
cartValueUpdate();
///Updating Price Details on My Cart page
async function priceDetailsUpdate(){
    const response1 = await fetch(`/cartItems/${window.localStorage.getItem('_userid_')}`);
    const dishIds = await response1.json();

    var totalPrice=0;
    for(dishId of dishIds){
        const resp = await fetch(`/dishDetail/${dishId.dishId}`);
        const dish = await resp.json();
        totalPrice += Number(dish.price*dishId.quantity);
    }
    const response2 = await fetch(`/priceUpdate/${window.localStorage.getItem('_userid_')}/${(totalPrice + 0.05 * totalPrice).toFixed(2)}`);
    //console.log(totalPrice);
    document.getElementById('totalPrice').innerText = totalPrice.toFixed(2);
    document.getElementById('priceGST').innerText = (0.05 * totalPrice).toFixed(2);
    document.getElementById('totalPayable').innerText = (totalPrice + 0.05 * totalPrice).toFixed(2);
}
///Rendering Review Section
async function reviewSection(){
    //const dish = {"category":"maincourse","cuisine":"chinese","_id":"ch01","name":"Kung Pao Chicken","price":459,"description":"Spicy chicken with peanuts, similar to what is served in Chinese restaurants. It is easy to make, and you can be as sloppy with the measurements as you want. They reduce to a nice, thick sauce. Substitute cashews for peanuts, or bamboo shoots for the water chestnuts. You can't go wrong! Enjoy!","image":"./img/Kung-Pao-Chicken.jpg","rating":{"total":37,"user_count":10}};
    const response = await fetch(`/cartItems/${window.localStorage.getItem('_userid_')}`);
    const dishIds = await response.json();

    const leaveReview = document.getElementById('leaveReview');

    for(dishId of dishIds){
        const res = await fetch(`/dishDetail/${dishId.dishId}`);
        const dish = await res.json();

        const root = document.createElement('div');
        root.classList.add('px-md-3');
        root.classList.add('mb-3');

        const dish_img = document.createElement('img');
        dish_img.src = dish.image;
        dish_img.alt = dish.name;
        dish_img.classList.add('review-dish-img');

        const dish_info_div = document.createElement('div');
        dish_info_div.classList.add('ml-2');

        const dish_name = document.createElement('p');
        dish_name.classList.add('mb-1');
        dish_name.innerText = dish.name;

        const label_rating = document.createElement('label');
        label_rating.setAttribute('for', 'dish-rating');
        label_rating.innerHTML = `Rating: <span class="text-danger">*</span>`;

        const select_rating = document.createElement('select');
        select_rating.classList.add('rating-dropdown');
        select_rating.name = 'dish-rating';
        select_rating.dishId = dish._id;
        select_rating.innerHTML = `<option value="5">5</option>
        <option value="4">4</option>
        <option value="3">3</option>
        <option value="2">2</option>
        <option value="1">1</option>`;

        const review_comment_div = document.createElement('div');
        review_comment_div.classList.add('row');
        review_comment_div.classList.add('mx-0');

        const review_comment = document.createElement('textarea');
        review_comment.name = 'review-comment';
        review_comment.rows = '3';
        review_comment.cols = '80'
        review_comment.classList.add('form-control');
        review_comment.placeholder = "Write a review(Optional)";

        dish_info_div.append(dish_name, label_rating, select_rating);
        review_comment_div.append(review_comment);
        root.append(dish_img, dish_info_div, review_comment_div);
        leaveReview.append(root);
    }
    document.getElementById('postReviews').addEventListener('click', () => {
        const dishRatings = document.getElementsByName('dish-rating');
        const reviewComments = document.getElementsByName('review-comment');
        const reviews = [];
        for(var i=0; i<dishRatings.length; i++){
            reviews.push({dishId: dishRatings[i].dishId, rating: dishRatings[i].value, comment: reviewComments[i].value.trim()});
        }
        window.sessionStorage.setItem('_reviews', JSON.stringify(reviews));
        if(!(window.sessionStorage.getItem('_reviews') === null))
            document.getElementById('proceedToPay').disabled = false;
    });
    document.getElementById('proceedToPay').addEventListener('click', async () => {
        const dishRatings = document.getElementsByName('dish-rating');
        const reviewComments = document.getElementsByName('review-comment');
        var ratings = [];
        const reviews = [];

        const response = await fetch(`/userAttribute/${window.localStorage.getItem('_userid_')}/name`);
        const name = await response.json();

        for(var i=0; i<dishRatings.length; i++){
            ratings.push({dishId: dishRatings[i].dishId, rating: dishRatings[i].value});
            if(reviewComments[i].value.trim().length){
                reviews.push({
                    author: name.name,
                    timestamp: new Date().getTime(),
                    dishId: dishRatings[i].dishId,
                    rating: dishRatings[i].value,
                    comment: reviewComments[i].value.trim()
                });
            }
        }
        console.log(JSON.stringify(reviews));
        console.log(JSON.stringify(ratings));
        const response1 = await fetch('/postReviews', {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(reviews)
        });
        const success1 = await response1.json();

        const response2 = await fetch('/ratingUpdate', {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(ratings)
        });
        const success2 = await response2.json();

        if(success1.success && success2.success){
            window.alert("Success");
            let errFlag = await false;
            for(rating of ratings){
                const response = await fetch(`/removeItemCart/${rating.dishId}`);
                const success = await response.json();
                if(!success.success){
                    errFlag = true;
                    break;
                }
            }
            const response = await fetch(`/removeUser/${window.localStorage.getItem('_userid_')}`);
            const success = await response.json();
            if(!errFlag && success.success){
                clearTempStorage(false);
                window.location.href = './redirect.html';
            }
        }
        else
            window.alert("Error");
    });
    const local_reviews = JSON.parse(window.sessionStorage.getItem('_reviews') || '[]');
    if(local_reviews.length){
        document.getElementById('proceedToPay').disabled = false;
        const dishRatings = document.getElementsByName('dish-rating');
        const reviewComments = document.getElementsByName('review-comment');
        //console.log(local_reviews);
        for(var i=0; i<local_reviews.length; i++){
            dishRatings[i].value = local_reviews[i].rating;
            reviewComments[i].value = local_reviews[i].comment;
        }
    }
}
async function clearTempStorage(flag){
    if(flag){
        if(window.confirm("Press OK to End Your Session Without Ordering")){
            const response1 = await fetch(`/removeUserEntities/${window.localStorage.getItem('_userid_')}`);
            //const success1 = response1.json();
            const response2 = await fetch(`/removeUser/${window.localStorage.getItem('_userid_')}`);
            const success2 = await response2.json();
            //console.log(`${success1.success} ${success2.success}`);
            if(success2.success){
                window.sessionStorage.removeItem('_reviews');
                window.localStorage.removeItem('_userid_');
                window.localStorage.removeItem('_seconds_');
                window.location.href = './index.html';
            }
        }
        return;
    }
    window.sessionStorage.removeItem('_reviews');
    window.localStorage.removeItem('_userid_');
    window.localStorage.removeItem('_checkout_');
    window.localStorage.removeItem('_seconds_');
    return;

}
