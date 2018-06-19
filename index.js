// https://github.com/iVesperX/nodegit-test.git

const path = require('path');

const Git = require('nodegit'),
    repoFolder = path.resolve(__dirname, './.git'),
    fileToStage = 'README.md';

let repo, index, oid, remote;

Git.Repository.open('.git')
  .then(function(repoResult) {
    console.log('opened ' + repoFolder);
    console.log(repoResult);
    repo = repoResult;
    return repoResult.openIndex();
  })
  .then(function(indexResult) {
    index = indexResult;

    // this file is in the root of the directory and doesn't need a full path
    index.addByPath(fileToStage);

    // this will write files to the index
    index.write();

    return index.writeTree();
  })
  .then(function(oidResult) {
    oid = oidResult;

    return Git.Reference.nameToId(repo, 'HEAD');
  })
  .then(function(head) {
    return repo.getCommit(head);
  })
  .then(function(parent) {
    author = Git.Signature.now('iVesperX', 'vesperx9@outlook.com');
    committer = Git.Signature.now('iVesperX', 'vesperx9@outlook.com');

    return repo.createCommit('HEAD', author, committer, 'Added the Readme file for theme builder', oid, [parent]);
  })
  .then(function(commitId) {
    return console.log('New Commit: ', commitId);
  })

  /// PUSH
  .then(function() {
    return repo.getRemote('origin');
  })
  .then(function(remoteResult) {
    console.log('remote Loaded');
    remote = remoteResult;
    remote.setCallbacks({
      credentials: function(url, userName) {
        return Git.Cred.sshKeyFromAgent(userName);
      }
    });
    console.log('remote Configured');

    return remote.connect(Git.Enums.DIRECTION.PUSH);
  })
  .then(function() {
    console.log('remote Connected?', remote.connected())

    return remote.push(
      ['refs/heads/master:refs/heads/master'],
      null,
      repo.defaultSignature(),
      'Push to master'
    )
  })
  .then(function() {
    console.log('remote Pushed!')
  })
  .catch(function(reason) {
    console.log(reason);
  })