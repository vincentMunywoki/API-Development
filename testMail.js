const nodemailer = require('nodemailer');

async function test() {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: "vincentmunywoki12@gmail.com",
            pass: "uvnw bpoo vghx xtat"
        }
    });

    let info = await transporter.sendMail({
        from: "vincentmunywoki12@gmail.com",
        to: "20050@student.embuni.ac.ke",
        subject: "Test Email",
        html: "<h1>If you see this, email works!</h1>"
    });

    console.log("Message sent:", info.messageId);
}

test().catch(console.error);
