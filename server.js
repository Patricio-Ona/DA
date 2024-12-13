const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const port = 3002;

// Middleware para procesar datos JSON
app.use(bodyParser.json());

// Middleware para manejar sesiones
app.use(
    session({
        secret: 'clave-secreta', // Cambia esta clave por una más segura
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 60 * 60 * 1000 } // 1 hora de duración
    })
);

// Middleware para servir archivos estáticos
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/pages', express.static(path.join(__dirname, 'pages')));

// Crear la carpeta DA si no existe
const daDirectory = path.join(__dirname, 'DA');
if (!fs.existsSync(daDirectory)) {
    fs.mkdirSync(daDirectory, { recursive: true });
}

// Ruta para la página principal (pp.html fuera de la carpeta pages)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pp.html'));
});

// Rutas específicas para los archivos HTML en la carpeta "pages"
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'login.html'));
});

app.get('/menu', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'Menu.html'));
});



app.get('/contacto', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'Contacto.html'));
});

app.get('/nosotros', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'Nosotros.html'));
});

// Ruta POST para registrar usuarios
app.post('/register', (req, res) => {
    const user = req.body;

    // Verificar campos obligatorios
    if (!user.username || !user.password || !user.email) {
        return res.status(400).json({ success: false, message: 'Datos incompletos. Los campos username, password y email son obligatorios.' });
    }

    const userData = `----------------------------
Usuario: ${user.username}
Correo: ${user.email}
Contraseña: ${user.password}
Nombre Completo: ${user.fullname || 'No especificado'}
Dirección: ${user.address || 'No especificada'}
Teléfono: ${user.phone || 'No especificado'}
Fecha de Nacimiento: ${user.birthday || 'No especificada'}
Ciudad: ${user.city || 'No especificada'}
País: ${user.country || 'No especificado'}
Código Postal: ${user.postalcode || 'No especificado'}
----------------------------\n`;

    const filePath = path.join(daDirectory, 'usuarios.txt');

    fs.appendFile(filePath, userData, (err) => {
        if (err) {
            console.error("Error al guardar el usuario:", err);
            return res.status(500).json({ success: false, message: 'Error al guardar el usuario.' });
        }
        res.status(200).json({ success: true, message: 'Usuario registrado correctamente.' });
    });
});

// Ruta POST para inicio de sesión
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Faltan datos.' });
    }

    const filePath = path.join(daDirectory, 'usuarios.txt');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
        }

        const users = data.split('----------------------------\n');
        const user = users.find(u => 
            u.includes(`Usuario: ${username}`) && u.includes(`Contraseña: ${password}`)
        );

        if (user) {
            // Extraer el nombre completo usando una expresión regular
            const fullNameMatch = user.match(/Nombre Completo:\s*(.+)/);
            const fullName = fullNameMatch ? fullNameMatch[1].trim() : 'Usuario';

            req.session.loggedIn = true;
            req.session.username = fullName; // Guardar el nombre en la sesión
            res.json({ success: true, message: 'Inicio de sesión exitoso.' });
        } else {
            res.status(401).json({ success: false, message: 'Credenciales incorrectas.' });
        }
    });
});

// Ruta POST para verificar si el usuario está autenticado
app.get('/auth-status', (req, res) => {
    if (req.session && req.session.loggedIn) {
        res.json({ authenticated: true, username: req.session.username });
    } else {
        res.json({ authenticated: false });
    }
});


// Ruta POST para cerrar sesión
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error al cerrar la sesión:", err);
            return res.status(500).json({ success: false, message: 'Error al cerrar sesión.' });
        }
        res.status(200).json({ success: true, message: 'Sesión cerrada correctamente.' });
    });
});

// Iniciar el servidor en el puerto 3002
app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://172.16.0.139:${port}`);
    console.log('Páginas disponibles:');
    console.log(`- Página Principal (PP): http://172.16.0.139:${port}/`);
    console.log(`- Login: http://172.16.0.139:${port}/login`);
    console.log(`- Menú: http://172.16.0.139:${port}/menu`);
    console.log(`- Contacto: http://172.16.0.139:${port}/contacto`);
    console.log(`- Nosotros: http://172.16.0.139:${port}/nosotros`);
});


