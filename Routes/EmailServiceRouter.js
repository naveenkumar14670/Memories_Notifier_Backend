const axios = require('axios');
const router = require('express').Router();
require('dotenv').config();

const checkDOB = (card) => {
    const today = new Date();
    const dob = new Date(card.dob);
    if ((today.getMonth() === dob.getMonth()) && (today.getDate() === dob.getDate()))
        return true;
    return false;
}

const getEmailMessage = (cards) => {
    let message = '<ul>';
    cards.forEach((card) => {
        message += `<li>${card.name} --- ${new Date(card.dob).toLocaleDateString()}</li>`
    });
    message += '</ul>'
    return message;
}

const sendEmail = async (cards) => {
    const emailMessage = getEmailMessage(cards);

    var data = {
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_USER_ID,
        accessToken: process.env.EMAILJS_ACCESS_TOKEN,
        template_params: {
            'message': emailMessage,
            'email': cards[0].email
        }
    };

    try {
        const res = await axios.post('https://api.emailjs.com/api/v1.0/email/send', data);
    }
    catch (err) {
        console.log("Error:", err.message);
    }
}

const scheduleEmails = async () => {
    const response = await axios.get(`${process.env.PROXY}/card/getAll`);
    const cardsData = response.data.filter(checkDOB);

    if (cardsData.length === 0)
        return;

    cardsData.sort((x, y) => {
        return x.email.localeCompare(y.email);
    });

    let currentCards = [];
    currentCards.push(cardsData[0]);

    for (let i = 1; i < cardsData.length; i++) {
        if (cardsData[i].email === cardsData[i - 1].email)
            currentCards.push(cardsData[i]);
        else {
            sendEmail(currentCards);
            currentCards = [];
            currentCards.push(cardsData[i]);
        }
    }
    sendEmail(currentCards);
    return;
}

router.get('/', async (req, res) => {
    console.log("scheduler is running");
    await scheduleEmails();
    res.status(200).json('Emails sent successfully');
});

module.exports = router;