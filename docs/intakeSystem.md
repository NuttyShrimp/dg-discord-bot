# IntakeSystem

User joins discord. Gets to see the #uitleg channel, which has an embed in it with the basic information.
This embed will have a button which will open a modal/form where the user is asked following questions:
- ... (fill in)

The answers for this modal are saved to the DB and sent to a seperate channel for intakers to see the submissions. All the messages in this channel will have a button that opens a modal where the responder can put a reason for denial.
This reason will be added to the messages + the responder info and the respond button will be removed.

If the intake was accepted the user will receive a message that his intake has been accepted and now goes through to the voice-intakes. He will also receive a role for that
