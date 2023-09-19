const brevo = require('@getbrevo/brevo');
let defaultClient = brevo.ApiClient.instance;

let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = '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';

let apiInstance = new brevo.TransactionalEmailsApi();
let sendSmtpEmail = new brevo.SendSmtpEmail();

sendSmtpEmail.subject = "My {{params.subject}}";
sendSmtpEmail.htmlContent = "<html><body><h1>Common: This is my first transactional email {{params.parameter}}</h1></body></html>";
sendSmtpEmail.sender = { "name": "John", "email": "asitpal211@gmail.com" };
sendSmtpEmail.to = [
  { "email": email }
];

apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
  console.log('API called successfully. Returned data: ' + JSON.stringify(data));
}, function (error) {
  console.error(error);
});