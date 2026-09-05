const { clientHistoryModel } = require("../models/historyModel")
const {userProgressSummaryModel} = require("../models/userProgressSummaryModel")
const {paymentModel}= require("../models/paymentHistoryModel")
const PdfPrinter = require("pdfmake");
const path = require("path")
const vfs = require('pdfmake/build/vfs_fonts.js').pdfMake.vfs;

function buildFilterSummary(query) {
    const parts = [];

    if (query.assignTo) parts.push(`Assign To = ${query.assignTo}`);
    if (query.product) parts.push(`Product = ${query.product}`);
    if (query.stage) parts.push(`Stage = ${query.stage}`);
    if (query.status) parts.push(`Status = ${query.status}`);
    if (query.label) parts.push(`Label = ${query.label}`);
    if (query.state) parts.push(`State = ${query.state}`);
    if (query.district) parts.push(`District = ${query.district}`);
    if (query.pincode) parts.push(`Pincode = ${query.pincode}`);

    if (query.dateFrom || query.dateTo) {
        parts.push(
            `Date Range = ${query.dateFrom || "Any"} → ${query.dateTo || "Any"}`
        );
    }

    return parts.length ? parts.join("  |  ") : "None";
}
 

const generateReport = async (req, res) => {
    try {
        const { assignTo, userId, roleType, clientType, product, stage, label, status, dateFrom, dateTo, state, district, pincode, } = req.query;
        console.log("report", req.query)
        let filters = {} 
        let result;
        if (roleType === "Executive") { 
            filters.userId_db = userId 
        }
        if (assignTo) {
            filters.userId_db = assignTo
        }
        if (product) {
            filters["product_db.label"] = { $regex: product, $options: "i" }
        }

        if (dateFrom || dateTo) {
            filters["date_db"] = {
                ...(dateFrom && { $gte: dateFrom }),
                ...(dateTo && { $lte: dateTo }),
            }
        }
        if (state) {
            filters.state_db = state
        }
        if (district) {
            filters.district_db = district
        }
        if (pincode) {
            filters.pincode_db = pincode
        }

        if (label) {
            filters.label_db = label
        }

        if (stage) {
            filters[`tracking_db.${stage}.completed`] = true
        }
        if (status) {
            console.log("done", status)
            filters["completion_db.status"] = status
        }
        console.log("filters", filters)
        if (product === "BARCODE" && stage === "installation_db" && status === "Unordered") {

            const matchOrder = {
                "product_db.label": "BARCODE",
                "tracking_db.installation_db.completed": true,
                "completion_db.status": "Done"
            }
            filters = { ...matchOrder }
            if (state) filters.state_db = state
            if (district) filters.district_db = district
            if (pincode) filters.pincode_db = pincode
            const orderClient = await clientHistoryModel.aggregate([
                {
                    $match: filters,
                },
                { $sort: { updatedAt: -1 } },
                {
                    $group: {
                        _id: "$client_id",
                        doc: { $first: "$$ROOT" },
                    }
                },
                {
                    $replaceRoot: {
                        newRoot: "$doc"
                    }
                },
                {
                    $sort: { date_db: 1 },
                }
            ])
            console.log("orderClient", orderClient)

            const unorderClient = orderClient.filter((doc) => doc.date_db < dateFrom)
            result = unorderClient
            console.log("unordeClient", result)
        } else {

            result = await clientHistoryModel.aggregate([
                { $match: filters },
                { $sort: { updatedAt: -1 } },
                {
                    $group: {
                        _id: "$client_id",
                        doc: { $first: "$$ROOT" },
                    }
                },
                {
                    $replaceRoot: {
                        newRoot: "$doc"
                    }
                },
                {
                    $sort: { date_db: 1 },
                }
            ])
        }
        console.log("filters", filters)
        res.status(200).json({ message: "Data found", result })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

const fonts = {
    Roboto: {
        normal: Buffer.from(vfs['Roboto-Regular.ttf'], 'base64'),
        bold: Buffer.from(vfs['Roboto-Medium.ttf'], 'base64'),
        italics: Buffer.from(vfs['Roboto-Italic.ttf'], 'base64'),
        bolditalics: Buffer.from(vfs['Roboto-MediumItalic.ttf'], 'base64'),
    }
}

const printer = new PdfPrinter(fonts);
// Create a Reusable PDF Service
const generatePDF = async ({ title, columns, rows, filters }) => {
    const tableBody = [columns, ...rows];

    const docDefinition = {
        pageSize: "A4",
        pageMargins: [20, 20, 20, 20],
        pageOrientation: "landscape",
        content: [
            { text: title, style: "header", fontSize: 10, alignment: "center", bold: true, color: "red" },
            { text: `Filters:${filters || "None"}`, margin: [0, 5, 0, 10] },
            {
                table: {
                    headerRows: 1,
                    // widths: Array(columns.length).fill("*"),
                    body: [columns, ...rows],
                },
                // layout: "lightHorizontalLines",
                layout: {
                    hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 0 : 0.5),
                    vLineWidth: () => 0,

                    // ---- HORIZONTAL LINE COLOR ----
                    hLineColor: () => '#aaa',

                    // ---- CELL PADDING ----
                    paddingLeft: () => 3,
                    paddingRight: () => 3,
                    paddingTop: () => 2,
                    paddingBottom: () => 2,
                }
            }
        ],
        styles: {
            header: { fontSize: 2, margin: [0, 0, 0, 0] },

        },
        defaultStyle: {
            fontSize: 8   // 👈 THIS MAKES TABLE TEXT SMALLER
        },

        footer: (currentPage, pageCount) => ({
            text: `Page ${currentPage} of ${pageCount}`,
            alignment: "right",
            fontSize: 7,
            margin: [0, 0, 10, 0],
        }),
    }

    const pdfDoc = printer.createPdfKitDocument(docDefinition)

    let chunks = [];
    return await new Promise((resolve) => {
        pdfDoc.on("data", (chunk) => chunks.push(chunk));
        pdfDoc.on("end", () => resolve(Buffer.concat(chunks)))
        pdfDoc.end()
    })
}


//pdf controller
const dataReport = async (req, res) => {
    try {
        const { assignTo, userId, roleType, clientType, product, stage, label, status, dateFrom, dateTo, state, district, pincode, } = req.query;
        console.log("report", req.query)
        let filters = {}
        let result;
        if (roleType === "Executive") {
            filters.userId_db = userId
        }
        if (assignTo) {
            filters.userId_db = assignTo
        }
        if (product) {
            filters["product_db.label"] = { $regex: product, $options: "i" }
        }

        if (dateFrom || dateTo) {
            filters["date_db"] = {
                ...(dateFrom && { $gte: dateFrom }),
                ...(dateTo && { $lte: dateTo }),
            }
        }
        if (state) {
            filters.state_db = state
        }
        if (district) {
            filters.district_db = district
        }
        if (pincode) {
            filters.pincode_db = pincode
        }

        if (label) {
            filters.label_db = label
        }

        if (stage) {
            filters[`tracking_db.${stage}.completed`] = true
        }
        if (status) {
            console.log("done", status)
            filters["completion_db.status"] = status
        }
        console.log("filters", filters)
        if (product === "BARCODE" && stage === "installation_db" && status === "Unordered") {

            const matchOrder = {
                "product_db.label": "BARCODE",
                "tracking_db.installation_db.completed": true,
                "completion_db.status": "Done"
            }
            filters = { ...matchOrder }
            if (state) filters.state_db = state
            if (district) filters.district_db = district
            if (pincode) filters.pincode_db = pincode
            const orderClient = await clientHistoryModel.aggregate([
                {
                    $match: filters,
                },
                { $sort: { updatedAt: -1 } },
                {
                    $group: {
                        _id: "$client_id",
                        doc: { $first: "$$ROOT" },
                    }
                },
                {
                    $replaceRoot: {
                        newRoot: "$doc"
                    }
                },
                {
                    $sort: { date_db: 1 },
                }
            ])

            const unorderClient = orderClient.filter((doc) => doc.date_db < dateFrom)
            result = unorderClient
        } else {

            result = await clientHistoryModel.aggregate([
                { $match: filters },
                { $sort: { updatedAt: -1 } },
                {
                    $group: {
                        _id: "$client_id",
                        doc: { $first: "$$ROOT" },
                    }
                },
                {
                    $replaceRoot: {
                        newRoot: "$doc"
                    }
                },
                {
                    $sort: { date_db: 1 },
                }
            ])
        }
        // console.log("---------------", result)
        const columns = [
            "Sr No",
            "Contact Person",
            "Client Type",
            "Status",
            "Product",
            "Date",
            "FollowUp Date",
            "Client Id",
            "Client Name",
            "Optical Name",
            "Mobile",
            "District",
            "State",
            "Pincode",
            "Paid Amount",
            "Mode of Payment",
        ];

        const val = (v) =>
            v === null || v === undefined || v === "" ? "NA" : v;

        const rows = result.map((p, index) => [
            index + 1,
            val(p.userId_db),
            val(p.database_status_db),
            val(p.completion_db?.status),
            val(p.product_db?.[0]?.label),
            val(p.date_db),
            val(p.followup_db?.date),
            val(p.client_id),
            val(p.client_name_db),
            val(p.optical_name1_db),
            val(p.mobile_1_db),
            val(p.district_db),
            val(p.state_db),
            val(p.pincode_db),
            val(p.amountDetails_db?.paidAmount),
            val(p.amountDetails_db?.mode),
        ])
        const filterSummary = buildFilterSummary(req.query);

        const pdfBuffer = await generatePDF({
            title: "Data Report",
            columns,
            rows,
            filters: filterSummary,
        })

        res.setHeader("Content-Type", "application/pdf")
        res.setHeader("Content-Disposition", "attachment; filename=report.pdf")
        res.send(pdfBuffer)
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

//Progress report controller 
const progressReport = async (req, res) => {
    try {
        const {  userId, roleType, assignTo,
            product,
            taskType,
            stage,
            dateFrom,
            dateTo } = req.query;
        let filters = {}
        if (assignTo) {
            filters.userId_db = assignTo
        }
        if (product) {
            filters.product_db = product
        }
        if (dateFrom || dateTo) {
            filters.date_db = {
                ...(dateFrom && {$gte:dateFrom}),
                ...(dateTo && {$lte:dateTo}),
            }
        }

        const result = await userProgressSummaryModel.find(filters)
        res.status(200).json({ result })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}


// Payment Report
const paymentReport = async(req,res) =>{ 
    try{ 
        const {userId,roleType} = req.query;
        let filters = {}
        // if(userId){
        //     filters.assignTo_db = userId
        // }
        // const result = await paymentModel.find(filters)

        const result = await paymentModel.aggregate([
            {
                $group:{
                    _id: "$client_id"
                }
            },
            // {
            //     $sort:"$createdAt"
            // }
        ])
        res.status(200).json({result})
    }catch(err){
        console.log("internal error",err)
        res.status(500).json({message:"internal error",err:err.message})
    }
}

module.exports = { generateReport, dataReport, progressReport, paymentReport }