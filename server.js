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

// --- GLOBAL MIDDLEWARE ---
app.use((req, res, next) => {
    const cart = req.session.cart || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    res.locals.cartCount = count;
    res.locals.hideLayout = false; 
    next();
});

// --- DATA: 16 PRODUCTS ---
const products = [
    // Original 6
    { id: 1, name: "Bamboo Sonic Brush", price: 45.00, image: "/images/brush.jpg", desc: "Electric clean, zero plastic." },
    { id: 2, name: "Matte Thermal Bottle", price: 32.00, image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80", desc: "Keeps hydration cold for 24h." },
    { id: 3, name: "Canvas Market Tote", price: 18.00, image: "/images/tote.jpg", desc: "Organic cotton daily carrier." },
    { id: 4, name: "Ceramic Travel Cup", price: 24.00, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=600&q=80", desc: "Barista standard reusable cup." },
    { id: 5, name: "Amber Soy Candle", price: 28.00, image: "/images/candle.jpg", desc: "Hand-poured essential oils." },
    { id: 6, name: "Minimalist Watch", price: 95.00, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80", desc: "Sustainable materials, timeless design." },
    
    // New 10 Placeholders
    { id: 7, name: "Recycled Notebook", price: 12.00, image: "/images/notebook.jpg", desc: "100% post-consumer waste paper." },
    { id: 8, name: "Solar Power Bank", price: 55.00, image: "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&w=600&q=80", desc: "Charge on the go with the sun." },
    { id: 9, name: "Hemp Backpack", price: 65.00, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80", desc: "Durable, natural fiber carry-all." },
    { id: 10, name: "Bamboo Cutlery Set", price: 15.00, image: "/images/bamboo.jpg", desc: "Portable utensils for zero-waste lunch." },
    { id: 11, name: "Cork Yoga Mat", price: 48.00, image: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=600&q=80", desc: "Non-slip, natural antimicrobial surface." },
    { id: 12, name: "Organic Cotton Tee", price: 25.00, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80", desc: "Soft, breathable, and fair trade." },
    { id: 13, name: "Glass Straw Set", price: 10.00, image: "/images/bamboo.jpg", desc: "Borosilicate glass with cleaning brush." },
    { id: 14, name: "Beeswax Food Wraps", price: 22.00, image: "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?auto=format&fit=crop&w=600&q=80", desc: "Washable alternative to plastic wrap." },
    { id: 15, name: "Biodegradable Phone Case", price: 30.00, image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=600&q=80", desc: "Compostable protection for your device." },
    { id: 16, name: "Upcycled Denim Jacket", price: 120.00, image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80", desc: "Vintage denim given a second life." }
];

// --- PLACEHOLDER REVIEWS ---
const reviews = [
    { user: "Alex M.", rating: 5, text: "Incredible quality and fast shipping. Love the eco-packaging!" },
    { user: "Sarah J.", rating: 4, text: "Great product, exactly as described. Will buy again." },
    { user: "Crowbar User", rating: 5, text: "Used my Crowbar credits for this. Totally worth it." }
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
    res.redirect(`https://www.crowbarltd.com/login?redirect_to=${encodedUrl}`);
});

app.get('/auth/callback', (req, res) => {
    res.render('callback', { title: 'Syncing Identity...', hideLayout: true });
});

app.get('/product/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);
    if (!product) return res.send("Product not found");
    res.render('product', { title: product.name, product, reviews }); // Pass reviews here
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

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) console.log(err);
        res.redirect('/');
    });
});

app.get('/checkout', (req, res) => res.redirect('https://crowbar-master-site.vercel.app/demo-checkout'));

const PORT = process.env.PORT || 4000;
if (require.main === module) {
    app.listen(PORT, () => console.log(`EcoWorldBuy running on http://localhost:${PORT}`));
}
module.exports = app;