// Insert your API Keys kere
const inboxsdkAPI = '###'; // https://www.inboxsdk.com/register
const openaiAPI = '###'; // https://beta.openai.com/account/api-keys

// This function remove signature from email
function removeSignature(emailText, openaiAPI) {
  fetch("https://api.openai.com/v1/completions", {
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt: `Remove signature from this email: ${emailText}`,
      temperature: 0.7,
      max_tokens: 600,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiAPI}`,
    },
    method: "POST",
  })
    .then((response) => response.json())
    .then(response => {
      if (response.choices[0].text !== '' && response.choices[0].text !== null) {
        str = JSON.stringify(response);
        emailText = response.choices[0].text;
        return emailText;

      } else {
        return emailText;
      }
    });
  return emailText;
}

// This function extract and concat emails in order to prepare the prompt
function extractEmail(emailList, openaiAPI) {
  var emailText = ''
  // Iterate over thread
  for (var i = 0; i < emailList.length; i++) {
    if (emailList[i].innerText.length > 5) {
      // Remove signature with GPT3.5 
      emailText = emailText + '\n' + 'Email ' + i + ':' + removeSignature(emailList[i].innerText, openaiAPI);
    }
  }

  if (emailText == '') {
    return 'Good morning, the email is blank so please reply with an apology, explaining that you found no email to reply to';
  } else {
    return emailText;
  }
}

// This function generate a new button with the logic to generate the answer
function newButton(buttonTitle, buttonIcon, promptIntro, openaiAPI, inboxsdkAPI) {
  InboxSDK.load(2, inboxsdkAPI).then(function (sdk) {
    sdk.Compose.registerComposeViewHandler(function (composeView) {
      composeView.addButton({
        title: buttonTitle,
        iconUrl: buttonIcon,
        onClick: function (event) {
          // Email text extraction
          var emailList = document.getElementsByClassName("ii");
          emailText = extractEmail(emailList, openaiAPI);
          prompting = `${promptIntro} ${emailText}`;
          console.log(prompting);
          fetch("https://api.openai.com/v1/completions", {
            body: JSON.stringify({
              model: "text-davinci-003",
              prompt: prompting,
              temperature: 0.7,
              max_tokens: 1200,
              top_p: 1,
              frequency_penalty: 0,
              presence_penalty: 0,
            }),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${openaiAPI}`,
            },
            method: "POST",
          })
            .then((response) => response.json())
            .then(response => {
              event.composeView.insertTextIntoBodyAtCursor(response.choices[0].text);
            });
        },
      });
    });
  });
}

// Button #1: Positive Answer
var promptIntro = `Respond in a positive tone of voice to the email (or sequence of emails)`;
var buttonTitle = 'Generate Positive Reply';
var buttonIcon = 'https://cdn-icons-png.flaticon.com/512/1161/1161833.png';
newButton(buttonTitle, buttonIcon, promptIntro, openaiAPI, inboxsdkAPI)

// Button #2 : Negative Answer
var promptIntro = `Reply negatively to email (or sequence of emails)`;
var buttonTitle = 'Generate Negative Reply';
var buttonIcon = 'https://cdn-icons-png.flaticon.com/512/3888/3888872.png';
newButton(buttonTitle, buttonIcon, promptIntro, openaiAPI, inboxsdkAPI)