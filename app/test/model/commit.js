
var model_commit = require('../../model/commit')




var testdata = require('../testdata')
var expect = require('expect.js');
var async = require('async');
var express = require('express');
var app = express();
app.use(express.bodyParser());
app.post('/rec/api/1.0', function (req, res) {
    res.header('Content-Type', 'application/json');
    res.send(req.body);
});
describe('model', function () {
    var testDB;
    var con;
    var commitDAO;
    var validParam;
    var server = null;
    before(function (done) {
        server = app.listen(3030).on('listening', done);
    });
    after(function () {
        server.close();
    });
    beforeEach(function (done) {
        validParam = {
            commitId: 401,
            commitMessage: 'test',
            contents: {
                NodeCount: 3,
                TopGoalId: 1,
                NodeList: [
                    {
                        ThisNodeId: 1,
                        Description: "dcase1",
                        Children: [
                            2
                        ],
                        NodeType: "Goal",
                        MetaData: [
                            {
                                Type: "Issue",
                                Subject: "このゴールを満たす必要がある",
                                Description: "詳細な情報をここに記述する",
                                Visible: "true"
                            }, 
                            {
                                Type: "LastUpdated",
                                User: "Shida",
                                Visible: "false"
                            }, 
                            {
                                Type: "Tag",
                                Tag: "tag1",
                                Visible: "true"
                            }, 
                            
                        ]
                    }, 
                    {
                        ThisNodeId: 2,
                        Description: "s1",
                        Children: [
                            3
                        ],
                        NodeType: "Strategy",
                        MetaData: []
                    }, 
                    {
                        ThisNodeId: 3,
                        Description: "g1",
                        Children: [],
                        NodeType: "Goal",
                        MetaData: [
                            {
                                Type: "Issue",
                                Subject: "2つ目のイシュー",
                                Description: "あああ詳細な情報をここに記述する",
                                Visible: "true"
                            }, 
                            {
                                Type: "LastUpdated",
                                User: "Shida",
                                Visible: "false"
                            }, 
                            {
                                Type: "Tag",
                                Tag: "tag1",
                                Visible: "true"
                            }, 
                            {
                                Type: "Tag",
                                Tag: "tag2",
                                Visible: "true"
                            }, 
                            {
                                Type: "Tag",
                                Tag: "newTag",
                                Visible: "true"
                            }, 
                            
                        ]
                    }
                ]
            }
        };
        testdata.begin([
            'test/default-data.yaml'
        ], function (err, c) {
            con = c;
            commitDAO = new model_commit.CommitDAO(con);
            done();
        });
    });
    afterEach(function (done) {
        con.rollback(function (err, result) {
            con.close();
            if(err) {
                throw err;
            }
            done();
        });
    });
    describe('commit', function () {
        describe('insert', function () {
            it('normal end', function (done) {
                var params = {
                    data: JSON.stringify(validParam.contents),
                    prevId: 401,
                    dcaseId: 201,
                    userId: 1,
                    message: validParam.commitMessage
                };
                commitDAO.insert(params, function (err, commitId) {
                    expect(err).to.be(null);
                    expect(commitId).not.to.be(null);
                    con.query('SELECT * FROM commit WHERE id=?', [
                        commitId
                    ], function (err, result) {
                        expect(err).to.be(null);
                        expect(result[0].id).to.be(commitId);
                        con.query('SELECT * FROM commit WHERE id = 401', function (err, result) {
                            expect(err).to.be(null);
                            expect(result[0].latest_flag).to.eql(false);
                            done();
                        });
                    });
                });
            });
            it('dcase id is not exists ', function (done) {
                var params = {
                    data: JSON.stringify(validParam.contents),
                    prevId: 401,
                    dcaseId: 999,
                    userId: 1,
                    message: validParam.commitMessage
                };
                commitDAO.insert(params, function (err, commitId) {
                    expect(err).not.to.be(null);
                    done();
                });
            });
        });
        describe('update', function () {
            it('normal end', function (done) {
                commitDAO.update(401, 'update test', function (err) {
                    expect(err).to.be(null);
                    con.query('SELECT * FROM commit WHERE id=401', function (err, result) {
                        expect(err).to.be(null);
                        expect(result[0].data).to.eql('update test');
                        done();
                    });
                });
            });
        });
        describe('_clearLastUpdateFlag', function () {
            it('normal end', function (done) {
                commitDAO._clearLastUpdateFlag(201, 999, function (err) {
                    expect(err).to.be(null);
                    con.query('SELECT * FROM commit WHERE dcase_id=201', function (err, result) {
                        expect(err).to.be(null);
                        expect(result[0].latest_flag).to.eql(false);
                        done();
                    });
                });
            });
        });
        describe('get', function () {
            it('normal end', function (done) {
                commitDAO.get(401, function (err, result) {
                    expect(err).to.be(null);
                    expect(result).not.to.be(null);
                    expect(result).not.to.be(undefined);
                    con.query('SELECT * FROM commit WHERE id=401', function (err, resultEx) {
                        expect(err).to.be(null);
                        expect(result.id).to.eql(resultEx[0].id);
                        expect(result.prevCommitId).to.eql(resultEx[0].prev_commit_id);
                        expect(result.dcaseId).to.eql(resultEx[0].dcase_id);
                        expect(result.userId).to.eql(resultEx[0].user_id);
                        expect(result.message).to.eql(resultEx[0].message);
                        expect(result.data).to.eql(resultEx[0].data);
                        expect(result.dateTime).to.eql(resultEx[0].date_time);
                        expect(result.latestFlag).to.eql(resultEx[0].latest_flag);
                        done();
                    });
                });
            });
        });
        describe('list', function () {
            it('normal end', function (done) {
                commitDAO.list(201, function (err, list) {
                    expect(err).to.be(null);
                    expect(list).not.to.be(null);
                    expect(list).not.to.be(undefined);
                    con.query('SELECT * FROM commit WHERE dcase_id=201 ORDER BY id', function (err, result) {
                        expect(err).to.be(null);
                        expect(list.length).to.eql(result.length);
                        expect(list[0].id).to.eql(result[0].id);
                        expect(list[0].prevCommitId).to.eql(result[0].prev_commit_id);
                        expect(list[0].dcaseId).to.eql(result[0].dcase_id);
                        expect(list[0].userId).to.eql(result[0].user_id);
                        expect(list[0].message).to.eql(result[0].message);
                        expect(list[0].data).to.eql(result[0].data);
                        expect(list[0].dateTime).to.eql(result[0].date_time);
                        expect(list[0].latestFlag).to.eql(result[0].latest_flag);
                        done();
                    });
                });
            });
        });
        describe('commit', function () {
            it('normal end', function (done) {
                this.timeout(15000);
                commitDAO.commit(1, 401, 'commit test', validParam.contents, function (err, result) {
                    expect(err).to.be(null);
                    expect(result).not.to.be(null);
                    expect(result).not.to.be(undefined);
                    expect(result.commitId).not.to.be(null);
                    expect(result.commitId).not.to.be(undefined);
                    con.query('SELECT * FROM commit WHERE id=?', [
                        result.commitId
                    ], function (err, resultCommit) {
                        expect(err).to.be(null);
                        expect(resultCommit[0].latest_flag).to.eql(true);
                        done();
                    });
                });
            });
        });
    });
});
