import { createSupaClient } from './databaseFun.js'

/*
Helper Functions for inserting , updating , and deleting receipts 
Helper Functions for inserting , updating , and deleting user custom items  
*/

/*
Data creation for making templates for the data
*/
export function createReceiptData({userId, storeName, total, date, items}) {
    let receipt = {
        "user_id": userId || undefined, 
        "store_name": storeName || undefined,
        "total": total || undefined,
        "date": date || undefined,
        "items": items || undefined
    }
    receipt = JSON.stringify(receipt)
    return receipt
}

export function createItemData({itemName, customName, price}) {
    let item = {
        "item_name": itemName || undefined, 
        "custom_name": customName || undefined,
        "price": price || undefined,
    }
    item = JSON.stringify(item)
    return item
}

export function createCustomItemData({command, userId, itemName, customName}) {
    let customItem = {
        "command": command || undefined,
        "user_id": userId || undefined,
        "item_name": itemName || undefined,
        "custom_name": customName || undefined,
    }
    customItem = JSON.stringify(customItem)
    return customItem
}


//RECEIPTS
//******************************
/*
Insert Receipt 
Takes in receipt data and items and posts them to the db 
uses edge function to manage receipt addition and items at the same time
*/
export async function insertReceipt(receiptData, itemsData) {
    let receipt = receiptData.items = itemsData
    const res = await receiptEdge(receipt)
    return res
}

/*
Delete Receipt 
Takes in receipt data and deletes the receipt and items from the db
uses edge functon to manage deleting at the same time
*/
export async function deleteReceipt(receiptData) {
    let receipt = receiptData.items = itemsData
    const res = await receiptEdge(receipt)
    return res
}


/*
Edit Receipt 
Takes in receipt data and updates it seperate to items update / edit  
*/
export async function editReceipt(userId, receiptId, storeName, total, date) {
    const supabase = await createSupaClient();
    const {data, error} = await supabase
        .from('receipt')
        .update({total: total , date: date , store_name: storeName})
        .eq('user_id', userId)
        .eq('receipt_id', receiptId)

    if (error) {
        throw error;
        return -1
    }
    //update success
    return 0  
}


/*
get receipt 
Takes in a user_id and receipt _id 
If a match is found return that receipt object and items
Returned as an object of {receipt_id: , store_name: , total: , date: }
*/
export async function getReceipt(userId, receiptId) {
    const supabase = await createSupaClient();
    const {data, error} = await supabase
        .from('receipt')
        .select('receipt_id, store_name, total, date')
        .eq('user_id', userId)
        .eq('receipt_id', receiptId)

    if (error) {
        throw error;
        return error
    }
    
    if (data[0] == undefined) {
        return -1 //receipt does not exist
    }
    
    return JSON.stringify({receipt_id: data[0].receipt_id, store_name: data[0].store_name, total: data[0].total, date: data[0].date})  
}


/*
get all receipts 
Takes in a user_id and returns all receipts associated with that account 

EXAMPLE how to loop through all the receipt results 

retVal = await getReceipts(3)
if (retVal == -1) throw error;
retVal = retVal.map(item => JSON.parse(item));
for (let item of retVal) {
    alert(`${item.receipt_id} , ${item.store_name}`)
} catch(error) {
    alert("No receipts exist for user")
}

*/
export async function getReceipts(userId) {
    const supabase = await createSupaClient();
    const {data, error} = await supabase
        .from('receipt')
        .select('receipt_id, store_name, total, date')
        .eq('user_id', userId)

    if (error) throw error;

    if (data[0] == undefined) return -1;

    const jsonStringData = data.map(item => JSON.stringify({receipt_id: item.receipt_id, store_name: item.store_name, total: item.total, date: item.date}));
    return jsonStringData  
}

//ITEMS
//******************************

/*
Insert item
Inserts item on receipt_id and user_id


try {
    item = createItemData({itemName: 'candy', price: 99999999})
    item = JSON.parse(item)
    retVal = await insertItem(3, 115, item)
    if (retVal == -1) throw error;
    retVal = JSON.parse(retVal)
    alert(`${retVal.item_name} added to receipt`)
} catch(error) {
    alert("Insert unsuccessful")
}
*/
export async function insertItem(userId, receiptId, item) {
    const supabase = await createSupaClient();
    const {data, error} = await supabase
        .from('item')
        .insert({user_id: userId , receipt_id: receiptId, item_name: item.item_name , custom_name: item.custom_name , price: item.price})
        .select()

    if (error) throw error;
    if (data[0] == undefined) return -1

    return JSON.stringify({item_name: data[0].item_name}) 
}

/*
edit item
takes in a user_id , receipt_id , item_id , and item object {}

try {
    item = await getItem(3, 115, 287) **Can also create item object**
    item = JSON.parse(item)
    item.item_name = "notPizza"

    retVal = await editItemsReceipt(3, 115, 287, item)
    if (retVal == -1) throw error;
    retVal = JSON.parse(retVal)
    alert(`${retVal.item_name} edited`)
} catch(error) {
    alert("Edit unsuccessful")
}
*/
export async function editItemsReceipt(userId, receiptId, itemId, item) {
    const supabase = await createSupaClient();
    const {data, error} = await supabase
        .from('item')
        .update({item_name: item.item_name, custom_name: item.custom_name, price: item.price})
        .eq('user_id', userId)
        .eq('receipt_id', receiptId)
        .eq('item_id', itemId)
        .select()

    if (error) throw error;
    if (data[0] == undefined) return -1

    return JSON.stringify({item_name: data[0].item_name})  
}

/*
get item 
Takes in an item_id , user_id , and receipt_id 
Returns the item at that id and receipt

EXAMPLE

try {
    retVal = await getItem(3, 114, 284)
    if (retVal == -1) throw error;
    retVal = JSON.parse(retVal)
    alert(`${retVal.item_name} , ${retVal.price}`)
} catch(error) {
    alert("No item exist")
}
*/
export async function getItem(userId, receiptId, itemId) {
    const supabase = await createSupaClient();
    const {data, error} = await supabase
        .from('item')
        .select('item_name, price, custom_name')
        .eq('user_id', userId)
        .eq('receipt_id', receiptId)
        .eq('item_id', itemId);

    if (error) throw error;
    if (data[0] == undefined) return -1;

    return JSON.stringify({item_name: data[0].item_name, custom_name: data[0].custom_name, price: data[0].price})
}

/*
get all item(s)
Takes in a user_id and receipt_id
Returns all the items associated with this receipt

EXAMPLE

try {
    retVal = await getItemsReceipt(3, 114)
    if (retVal == -1) throw error;
    retVal = retVal.map(item => JSON.parse(item));
    for (let item of retVal) {
        alert(`${item.item_name} , ${item.price}`)
    }
} catch(error) {
    alert("No items on this receipt")
}
*/
export async function getItemsReceipt(userId, receiptId) {
    const supabase = await createSupaClient();
    const {data, error} = await supabase
        .from('item')
        .select('item_name, price, custom_name')
        .eq('user_id', userId)
        .eq('receipt_id', receiptId)

    if (error) throw error;
    if (data[0] == undefined) return -1;

    const jsonStringArray = data.map(item => JSON.stringify({item_name: item.item_name, custom_name: item.custom_name, price: item.price}))
    return jsonStringArray
}

/*
delete item
Takes in a user_id , receipt_id , and item_id

EXAMPLE 
try {
    retVal = await deleteItemsReceipt(3, 114, 286)
    if (retVal == -1) throw error;
    retVal = JSON.parse(retVal)
    alert(`${retVal.item_name} deleted`)
} catch(error) {
    alert("Delete unsuccessful")
}
*/
export async function deleteItemsReceipt(userId, receiptId, itemId) {
    const supabase = await createSupaClient();
    const {data, error} = await supabase
        .from('item')
        .delete()
        .eq('user_id', userId)
        .eq('receipt_id', receiptId)
        .eq('item_id', itemId)
        .select()

    if (error) throw error;
    return (data[0] == undefined) ? -1 : JSON.stringify({item_name: data[0].item_name});

}


//CUSTOM NAMES
//******************************
/*
Delete custom 
Takes in an item name and deletes the custom name associated with that item
Will also delete all previous occurances of that custom name for the item name in items
*/
export async function deleteCustomItem(userId, itemName) {
    let customItem = createCustomItemData({command: 'delete', userId: userId, itemName: itemName})
    let res = await customEdge(customItem)
    return res
}


/*
Delete all custom on all items 
Takes in an custom name and deletes the custom name for all items associated
with that name also delete all previous occurances of that custom name for every item name in items
*/
export async function deleteCustomAll(userId, customName) {
    let customItem = createCustomItemData({command: 'delete_all', userId: userId, customName: customName})
    let res = await customEdge(customItem)
    return res
}

/*
upsert custom 
Takes in an item name and custom name and inserts or updates that items custom name to the new one
Will also insert or update all previous occurances of that item name to be the new custom item name in items
*/
export async function upsertCustomItem(userId, itemName, customName) {
    let customItem = createCustomItemData({command: 'upsert', userId: userId, itemName: itemName, customName: customName})
    let res = await customEdge(customItem)
    return res
}


/*
upsert custom on all items
Takes in a custom name and updates that custom name to the new one
across all items that have that custom name
also update all previous occurances of that custom name to be the new custom name in items
*/
export async function upsertCustomAll(userId, customName) {
    let customItem = createCustomItemData({command: 'upsert_all', userId: userId, customName: customName})
    let res = await customEdge(customItem)
    return res
}


/*
get custom item
takes in user_id and item_name 
returns the item_name to custom_name relationships

EXAMPLE **********
try {
    retVal = await getCustomItem(3, "letuce")
    if (retVal == -1) throw error;
    retVal = JSON.parse(retVal)
    alert(`${retVal.item_name} , ${retVal.custom_name}`)
} catch(error) {
    alert("Couldnt find item")
}
*/
export async function getCustomItem(userId, itemName) {
    const supabase = await createSupaClient();
    const {data, error} = await supabase
        .from("item_custom_name")
        .select("item_name, custom_name")
        .eq("user_id", userId)
        .eq("item_name", itemName)

    if (error) throw error

    if (data[0] == undefined) {
        return -1
    }

    return JSON.stringify({item_name: data[0].item_name, custom_name: data[0].custom_name})
}


/*
get custom all 
takes in user_id and custom_name 
returns all the item_name to custom_name relationsjhips for that custom_name

EXAMPLE 
try{
    retVal = await getCustomAll(3, 'salad')
    if (retVal == -1) throw error;
    retVal = retVal.map(item => JSON.parse(item));
    for (let item of retVal) {
        alert(`${item.item_name} , ${item.custom_name}`)
} catch(error) {
    alert("No custom names with this value exist")
}
*/
export async function getCustomAll(userId, customName) {
    const supabase = await createSupaClient();
    const {data, error} = await supabase
        .from("item_custom_name")
        .select("item_name, custom_name")
        .eq("user_id", userId)
        .eq("custom_name", customName)

    if (error) throw error;
    if (data[0] == undefined) return -1;

    const jsonStringArray = data.map(item => JSON.stringify({item_name: item.item_name, custom_name: item.custom_name}));
    return jsonStringArray
}


/*
get all user custom names
return every custom name and item the user has set

EXAMPLE 

try {
    retVal = await getCustomItemsUser(3)
    if (retVal == -1) throw error;
    retVal = retVal.map(item => JSON.parse(item));
    for (let item of retVal) {
        alert(`${item.item_name} , ${item.custom_name}`)
    }
} catch(error) {
    alert("No custom names for user")
}
*/
export async function getCustomItemsUser(userId) {
    const supabase = await createSupaClient();
    const {data, error} = await supabase
        .from("item_custom_name")
        .select("item_name, custom_name")
        .eq("user_id", userId)

    if (error) throw error;
    if (data[0] == undefined) return -1;
    
    const jsonStringArray = data.map(item => JSON.stringify({item_name: item.item_name, custom_name: item.custom_name}));
    return jsonStringArray
}




export default { createReceiptData, createItemData, createCustomItemData, insertReceipt, deleteReceipt , editReceipt, getReceipt, getReceipts,
        insertItem, editItemsReceipt, getItem, getItemsReceipt, deleteItemsReceipt, deleteCustomItem, deleteCustomAll, upsertCustomItem,
        upsertCustomAll, getCustomItem, getCustomAll, getCustomItemsUser }