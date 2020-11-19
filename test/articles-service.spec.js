const ArticlesService = require('../src/articles-service')
const knex = require('knex')
const { expect } = require('chai')

describe('Articles service object', function() {
    let db

    let testArticles = [
        {
            id: 1,
            date_published: new Date('2029-01-22T16:28:32.615Z'),
            title: 'First test post!',
            content: 'lorem ipsum aaa'
        },
        {
            id: 2,
            date_published: new Date('2100-05-22T16:28:32.615Z'),
            title:'Second test post!',
            content: 'lorem ipsum bbb'
        },
        {
            id: 3,
            date_published: new Date('1919-12-22T16:28:32.615Z'),
            title: 'Third test post!',
            content: 'lorem ipsum ccc'
        },
    ]

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
    })

    before(() => db('blogful_articles').truncate())

    afterEach(() => db('blogful_articles').truncate())


    after(() => db.destroy())

    context(`Given 'blogful_articles' has data`, () => {
        beforeEach(() => {
            return db
                .into ('blogful_articles')
                .insert(testArticles)
        })
    
        it(`getAllArticles() resolves all articles from 'blogful_articles' table`, () => {
            // test that ArticlesService.getAllArticles gets data from table
            return ArticlesService.getAllArticles(db)
                .then(actual => {
                    expect(actual).to.eql(testArticles)
                })
        })

        it(`getById() resolves an article by id from 'blogful_articles' table`, () => {
            const thirdId = 3
            const thirdTestArticle = testArticles[thirdId - 1]
            return ArticlesService.getById(db, thirdId)
                .then(actual => {
                    expect(actual).to.eql({
                        id: thirdId,
                        title: thirdTestArticle.title,
                        content: thirdTestArticle.content,
                        date_published: thirdTestArticle.date_published
                    })
                })
        })

        it(`deleteArticle() removes an article by id from 'blogful_articles' table`, () => {
            const articleId = 3
            return ArticlesService.deleteArticle(db, articleId)
                .then(() => ArticlesService.getAllArticles(db))
                .then(allArticles => {
                    // copy the test articles array without the "deleted" article
                    const expected = testArticles.filter(article => article.id !== articleId)
                    expect(allArticles).to.eql(expected)
                })
        })

        it(`updateArticle() updates an article from the 'blogful_articles' table`, () => {
            const idOfArticleToUpdate = 3
            const newArticleData = {
                title: 'updated title',
                content: 'updated content',
                date_published: new Date()
            }
            return ArticlesService.updateArticle(db, idOfArticleToUpdate, newArticleData)
                .then(() => ArticlesService.getById(db, idOfArticleToUpdate))
                .then(article => {
                    expect(article).to.eql({
                        id: idOfArticleToUpdate,
                        ...newArticleData,
                    })
                })
        })
    })

    context(`Given 'blogful_articles' has no data`, () => {
        it(`getAllArticles() resolve an empty array`, () => {
            return ArticlesService.getAllArticles(db)
                .then(actual => {
                    expect(actual).to.eql([])
                })
        })

        it(`insertArticle() inserts a new article and resolves it with an 'id'`, () => {
            const newArticle = {
                title: 'Test new title',
                content: 'Test new content',
                date_published: new Date('2020-01-01T00:00:00.000Z'),
            }
            return ArticlesService.insertArticle(db, newArticle)
                .then(actual => {
                    expect(actual).to.eql({
                        id: 1,
                        title: newArticle.title,
                        content: newArticle.content,
                        date_published: newArticle.date_published,
                    })
                })
        })

        
    })
})