const slackTemplate = (quote) => {
  const data = {
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `${quote.name}: \n *${quote.quote}*`
        }
      }
    ]
  }
  return data;
}

module.exports = slackTemplate;