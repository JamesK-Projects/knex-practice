const ShoppingListService = require('../src/shopping-list-service')
const knex = require('knex')
const { expect } = require('chai')

describe.only('Shopping List service object', function() {
    let db

    let testItems = [
        {
            id: 1,
            name: 'First test post!',
            date_added: new Date('2029-01-22T16:28:32.615Z'),
            checked: false,
            price: '10.00',
            category: 'Main'
        },
        {
            id: 2,
            name: 'Second test post!',
            date_added: new Date('2100-05-22T16:28:32.615Z'),
            checked: false,
            price: '20.00',
            category: 'Snack'
        },
        {
            id: 3,
            name: 'Third test post!',
            date_added: new Date('1919-12-22T16:28:32.615Z'),
            checked: false,
            price: '30.00',
            category: 'Lunch'
        },
        {
            id: 4,
            name: 'Fourth test post!',
            date_added: new Date('1919-12-22T16:28:32.615Z'),
            checked: false,
            price: '40.00',
            category: 'Breakfast'
        },
    ]

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
    })

    before(() => db('shopping_list').truncate())

    afterEach(() => db('shopping_list').truncate())

    after(() => db.destroy())

    context(`Given 'shopping_list' has data`, () => {
        beforeEach(() => {
            return db
                .into ('shopping_list')
                .insert(testItems)
        })

        it(`getAllItems() resolves all items from 'shopping_list' table`, () => {
            return ShoppingListService.getAllItems(db)
                .then(actual => {
                    expect(actual).to.eql(testItems)
                })
        })

        it(`getById() resolves an item by id from 'shopping_list' table`, () => {
            const thirdId = 3
            const thirdTestItem = testItems[thirdId - 1]
            return ShoppingListService.getById(db, thirdId)
                .then(actual => {
                    expect(actual).to.eql({
                        id: thirdId,
                        name: thirdTestItem.name,
                        date_added: thirdTestItem.date_added,
                        price: thirdTestItem.price,
                        category: thirdTestItem.category
                    })
                })
        })

        it(`deleteArticle() removes an article by id from 'shopping_list' table`, () => {
            const itemId = 3
            return ShoppingListService.deleteItem(db, itemId)
                .then(() => ShoppingListService.getAllItems(db))
                .then(allItems => {
                    const expected = testItems.filter(item => item.id !== itemId)
                    expect(allItems).to.eql(expected)
                })
        })

        it(`updateItem() updates an item from the 'shopping_list' table`, () => {
            const idOfItemToUpdate = 3
            const newItemData = {
                name: 'updated name',
                date_added: new Date(),
                price: 'updated price',
                category: 'Snack'
            }
            return ShoppingListService.updateItem(db, idOfItemToUpdate, newItemData)
                .then(() => ShoppingListService.getById(db, idOfItemToUpdate))
                .then(item => {
                    expect(item).to.eql({
                        id: idOfItemToUpdate,
                        ...newItemData,
                    })
                })
        })
    })


    context(`Given 'shopping_list' has no data`, () => {
        it(`getAllItems() resolve an empty array`, () => {
            return ShoppingListService.getAllItems(db)
                .then(actual => {
                    expect(actual).to.eql([])
                })
        })

        it(`insertedItem() inserts a new item and resolves it with an 'id'`, () => {
            const newItem = {
                name: 'Test new name',
                date_added: new Date('2020-01-01T00:00:00.000Z'),
                price: 'Test new price',
                category: 'Test new category'
            }
            return ShoppingListService.insertItem(db, newItem)
                .then(actual => {
                    expect(actual).to.eql({
                        id: 1,
                        name: newItem.name,
                        date_added: newItem.date_added,
                        price: newItem.price,
                        category: newItem.category,
                    })
                })
        })
    })
})