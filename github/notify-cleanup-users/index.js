const core = require('@actions/core')
const github = require('@actions/github')
const fetch = require("node-fetch")

try {
    const inactiveUsers = core.getInput('inactive-users')
    const ignoredUsers = core.getInput('ignored-users')
    const googleChatWebhookUrl = core.getInput('google-chat-webhook-url')

    core.info(googleChatWebhookUrl)
    core.info(inactiveUsers)
    core.info(ignoredUsers)

    var data;
    if (inactiveUsers === undefined || inactiveUsers.length == 0) {
        data = `{
            "cards": [
              {
                "header": {
                  "title": "Time to cleanup GitHub users!",
                  "subtitle": "7 days to go for the next billing cycle to start!"
                },
                "sections": [
                  {
                    "widgets": [
                      {
                        "keyValue": {
                          "topLabel": "Inactive Users (Last 30 Days)",
                          "content": "No inactive users 👍!"
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }`
    } else {
        if (ignoredUsers === undefined || ignoredUsers.length == 0) {
            data = `{
                "cards": [
                  {
                    "header": {
                      "title": "Time to cleanup GitHub users!",
                      "subtitle": "7 days to go for the next billing cycle to start!"
                    },
                    "sections": [
                      {
                        "widgets": [
                          {
                            "keyValue": {
                              "topLabel": "Inactive Users (Last 30 Days)",
                              "content": "${inactiveUsers.join(", ")}"
                            }
                          }
                        ]
                      },
                      {
                        "widgets": [
                          {
                            "buttons": [
                              {
                                "textButton": {
                                  "text": "MANAGE MEMBERS",
                                  "onClick": {
                                    "openLink": {
                                      "url": "https://github.com/orgs/aleph-labs/people"
                                    }
                                  }
                                }
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }`
        } else {
            data = `{
                "cards": [
                  {
                    "header": {
                      "title": "Time to cleanup GitHub users!",
                      "subtitle": "7 days to go for the next billing cycle to start!"
                    },
                    "sections": [
                      {
                        "widgets": [
                          {
                            "keyValue": {
                              "topLabel": "Inactive Users (Last 30 Days)",
                              "content": "${inactiveUsers.join(", ")}"
                            }
                          },
                          {
                            "keyValue": {
                              "topLabel": "Ignored Users (Probably an Admin)",
                              "content": "${ignoredUsers.join(", ")}"
                            }
                          }
                        ]
                      },
                      {
                        "widgets": [
                          {
                            "buttons": [
                              {
                                "textButton": {
                                  "text": "MANAGE MEMBERS",
                                  "onClick": {
                                    "openLink": {
                                      "url": "https://github.com/orgs/aleph-labs/people"
                                    }
                                  }
                                }
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }`
        }
    }

    core.info(data)

    fetch(googleChatWebhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: data,
    })
        .then(response => response.json())
        .then(data => {
            core.info('Success:', data);
        })
        .catch((error) => {
            core.setFailed(error)
        });
} catch (error) {
    core.setFailed(error.message)
}