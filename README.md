## Steps
1 - Execute your application to run it and make it accesible to another programs
2 - Install the K6s using setup-k6s
3 - Execute the K6s!
4 - Show the message in the PR, using this:
```yml
- name: PR comment with file
  uses: thollander/actions-comment-pull-request@v2
  with:
    filePath: message.md
```
