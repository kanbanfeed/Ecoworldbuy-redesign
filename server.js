const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const path = require('path');

// --- CONFIG ---
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout');
app.use(express.static(path.join(__dirname, 'public')));

// --- DUMMY DATA (6 Products) ---
const products = [
    { id: 1, name: "Bamboo Toothbrush Set", price: 12.99, image: "https://images.unsplash.com/photo-1607613009820-a29f7bb6dcaf?auto=format&fit=crop&w=800&q=80", desc: "Biodegradable brushes." },
    { id: 2, name: "Reusable Metal Straws", price: 8.50, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80", desc: "Say no to plastic." },
    { id: 3, name: "Organic Cotton Tote", price: 15.00, image: "https://images.unsplash.com/photo-1597484662317-c9253e609490?auto=format&fit=crop&w=800&q=80", desc: "Durable and washable." },
    { id: 4, name: "Glass Water Bottle", price: 22.00, image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80", desc: "Hydration plastic-free." },
    { id: 5, name: "Natural Soy Candle", price: 25.00, image: "https://images.unsplash.com/photo-1602826626727-977534824b49?auto=format&fit=crop&w=800&q=80", desc: "Clean burning scent." }, // Changed to candle for better visual
    { id: 6, name: "Recycled Notebook", price: 9.99, image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80", desc: "Write sustainably." }
];
// --- ROUTES ---

// 1. Home Page
app.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});

// 2. Catalog (Shop)
app.get('/shop', (req, res) => {
    res.render('shop', { title: 'Shop', products });
});

// 3. Product Page
app.get('/product/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);
    if (!product) return res.send("Product not found");
    res.render('product', { title: product.name, product });
});

// 4. Cart (Dummy)
app.get('/cart', (req, res) => {
    // We just pass a dummy item to make it look populated
    res.render('cart', { title: 'Your Cart' });
});

// 5. CHECKOUT REDIRECT LOGIC
app.get('/checkout', (req, res) => {
    // REQUIREMENT: Redirect to Crowbar Pricing
    res.redirect('https://crowbar-master-site.vercel.app/pricing'); 
});

const PORT = 4000; // Using 4000 to avoid conflict with TalentKonnect
app.listen(PORT, () => console.log(`ECOWORLDBUY running at http://localhost:${PORT}`));