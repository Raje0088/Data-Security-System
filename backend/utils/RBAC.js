const ensurePlain = (doc) => {
    // If it's a mongoose doc, convert to plain object
    if (doc && typeof doc.toObject === 'function') return doc.toObject();
    return doc;
};

const applyRBAC = (record, region, permission,majorPerm) => {
    const pincodeList = new Set()
    region?.map((stateObj, idx) => (
        stateObj.districts?.map((dist, indjex) => {
            dist.pincodes.map((pin, k) => (
                pincodeList.add(pin.code)
            ))
        })
    ))
    // console.log("delete",majorPerm)
    const data = record.map((rawDoc, idx) => {
        const doc = ensurePlain(rawDoc)

        const allow = pincodeList.has(doc.pincode_db)
        // console.log("allow",pincodeList,allow)
        const allowedView = permission?.view_P || allow
        const allowedDelete = majorPerm?.delete_P && allow
        const allowedUpdate = permission?.update_P
        const allowedEdit = permission?.edit_P

        return {
            ...doc,
            isView: allowedView,
            isDelete: allowedDelete,
            isUpdate: allowedUpdate,
            isEdit: allowedEdit,
        }
    })
    return data;

}

const applyRBACwithoutProduct = (records, allProductRegion,majorPerm) => {
    const pincodeList = new Set()
    allProductRegion.map((prod, i) => (
        prod.region.map((stateObj, j) => (
            stateObj.districts.map((dist, k) => (
                dist.pincodes.map((pin, l) => (
                    pincodeList.add(pin.code)
                ))
            ))
        )) 
    ))
// console.log("pincodeLIst",pincodeList)
    const data = records.map((rawDoc, idx) => {
        const doc = ensurePlain(rawDoc)
        const allowView = pincodeList.has(doc.pincode_db)
        const isDeleleAllow = allowView && majorPerm?.delete_P 
        // console.log("allowVew",pincodeList.size,allowView,doc.pincode_db)
        return {
            ...doc,
            isView: allowView,
            isDelete: isDeleleAllow,
            isUpdate: true,
            isEdit: true,
        }
    })
    return data;
}

module.exports = { applyRBAC, applyRBACwithoutProduct }                                                                    