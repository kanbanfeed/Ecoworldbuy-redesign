require('dotenv').config();
const express = require('express');
const session = require('express-session');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const path = require('path');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// SESSION
app.use(session({
    secret: 'eco-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// --- NEW: GLOBAL VARIABLES MIDDLEWARE ---
app.use((req, res, next) => {
    // 1. Cart Count Logic
    const cart = req.session.cart || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    res.locals.cartCount = count;

    // 2. Default Layout Settings (Show Header/Footer by default)
    res.locals.hideLayout = false; 

    next();
});

// --- DATA ---
const products = [
   { 
        id: 1, 
        name: "Bamboo Sonic Brush", 
        price: 45.00, 
        image: "/images/brush.jpg", // Points to public/images/brush.jpg
        desc: "Electric clean, zero plastic." 
    },
    { 
        id: 2, 
        name: "Matte Thermal Bottle", 
        price: 32.00, 
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80", 
        desc: "Keeps hydration cold for 24h." 
    },
    { 
        id: 3, 
        name: "Canvas Market Tote", 
        price: 18.00, 
        image: "/images/tote.jpg", 
        desc: "Organic cotton daily carrier." 
    },
    { id: 4, name: "Ceramic Travel Cup", price: 24.00, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=600&q=80", desc: "Barista standard reusable cup." },
{ 
        id: 5, 
        name: "Amber Soy Candle", 
        price: 28.00, 
        image: "/images/candle.jpg", 
        desc: "Hand-poured essential oils." 
    },
        { id: 6, name: "Minimalist Watch", price: 95.00, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80", desc: "Sustainable materials, timeless design." }
];


// --- ROUTES ---
app.get('/', (req, res) => res.render('index', { title: 'Home', products }));
app.get('/shop', (req, res) => res.render('shop', { title: 'Collection', products }));

app.get('/login', (req, res) => {
    
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const baseUrl = `${protocol}://${host}`;
    
    
    const returnUrl = `${baseUrl}/auth/callback`;
    
    
    const encodedUrl = encodeURIComponent(returnUrl);
    
    // 4. Redirect to Crowbar Master Login
   
    res.redirect(`https://www.crowbarltd.com/login?redirect_to=${encodedUrl}`);
});

app.get('/auth/callback', (req, res) => {
    res.render('callback', { title: 'Syncing Identity...' });
});

app.get('/product/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);
    if (!product) return res.send("Product not found");
    res.render('product', { title: product.name, product });
});

app.post('/add-to-cart/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const quantity = parseInt(req.body.quantity) || 1;
    const product = products.find(p => p.id === productId);
    if (!req.session.cart) req.session.cart = [];
    const existingItem = req.session.cart.find(item => item.id === productId);
    if (existingItem) { existingItem.quantity += quantity; } 
    else { req.session.cart.push({ ...product, quantity: quantity }); }
    res.redirect('/cart');
});

app.post('/update-cart', (req, res) => {
    const { productId, action } = req.body;
    const id = parseInt(productId);
    const cart = req.session.cart || [];
    const itemIndex = cart.findIndex(p => p.id === id);
    if (itemIndex > -1) {
        if (action === 'increase') cart[itemIndex].quantity++;
        else if (action === 'decrease') {
            if (cart[itemIndex].quantity > 1) cart[itemIndex].quantity--;
            else cart.splice(itemIndex, 1);
        } else if (action === 'remove') cart.splice(itemIndex, 1);
    }
    req.session.cart = cart;
    res.redirect('/cart');
});

app.get('/cart', (req, res) => {
    const cart = req.session.cart || [];
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    res.render('cart', { title: 'Your Bag', cart, total });
});

app.get('/checkout', (req, res) => res.redirect('https://www.crowbarltd.com/demo-checkout'));

const PORT = process.env.PORT || 4000;
if (require.main === module) {
    app.listen(PORT, () => console.log(`EcoWorldBuy running on http://localhost:${PORT}`));
}
module.exports = app;