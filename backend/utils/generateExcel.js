const xlsx = require("xlsx")
const { rawDataModel } = require("../models/rawDataModel")
const { clientModel } = require("../models/clientModel")
const { clientSubscriptionModel } = require("../models/clientSubscriptionModel")

//THIS DOWNLOAD 500 RECORDS IN EXCEL SHEET
// const generateExcelSheet = async (dataArray, sheetName) => {
//   try {
//     const sheet = xlsx.utils.json_to_sheet(dataArray) //convert json to worksheet
//     const workbook = {
//       SheetNames: [sheetName],
//       Sheets: {
//         [sheetName]: sheet
//       }
//     }
//     const buffer = xlsx.write(workbook, { bookType: "xlsx", type: "buffer" })

//     return buffer;
//   } catch (err) {
//     console.log('internal error', err)
//     throw err;
//   }
// }

//THIS DOWNLOAD 500 RECORDS IN EXCEL SHEET
// const excelDownloadController = async (req, res) => {
//   const { dataArray, sheetName } = req.body;
//   const buffer = await generateExcelSheet(dataArray, sheetName || "Sheet1");
//   console.log("buffer",buffer)

//   res.setHeader(
//     "Content-Type", 
//     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//   );
//   res.setHeader(
//     "Content-Disposition",
//     `attachment; filename=${sheetName || "Sheet1"}.xlsx`
//   );

//   res.send(buffer);
// };

const buildFilters = (body) => {
  const {
    clientId, clientName, opticalName, address, mobile, email,
    district, state, product, hot, followUp, demo, installation,
    amc, defaulter, recovery, lost, dateFrom, dateTo, deactivate, pincode
  } = body;

  const filters = {};

  if (clientId) filters.client_id = clientId;
  if (pincode?.length) filters.pincode_db = { $in: pincode };
  if (clientName) filters.client_name_db = { $regex: clientName, $options: "i" };

  if (opticalName) {
    filters.$or = [
      { optical_name1_db: { $regex: opticalName, $options: "i" } },
      { optical_name2_db: { $regex: opticalName, $options: "i" } },
      { optical_name3_db: { $regex: opticalName, $options: "i" } },
    ];
  }

  if (address) {
    filters.$or = [
      { address_1_db: { $regex: address, $options: "i" } },
      { address_2_db: { $regex: address, $options: "i" } },
      { address_3_db: { $regex: address, $options: "i" } },
    ];
  }

  if (mobile) {
    filters.$or = [
      { mobile_1_db: { $regex: mobile, $options: "i" } },
      { mobile_2_db: { $regex: mobile, $options: "i" } },
      { mobile_3_db: { $regex: mobile, $options: "i" } },
    ];
  }

  if (email) {
    filters.$or = [
      { email_1_db: { $regex: email, $options: "i" } },
      { email_2_db: { $regex: email, $options: "i" } },
      { email_3_db: { $regex: email, $options: "i" } },
    ];
  }

  if (district) filters.district_db = { $regex: district, $options: "i" };
  if (state) filters.state_db = { $regex: state, $options: "i" };
  if (product) filters["product_db.label"] = { $regex: product, $options: "i" };

  if (hot) filters["tracking_db.hot_db.completed"] = true;
  if (followUp) filters["tracking_db.follow_up_db.completed"] = true;
  if (demo) filters["tracking_db.demo_db.completed"] = true;
  if (installation) filters["tracking_db.installation_db.completed"] = true;
  if (amc) filters["tracking_db.amc_db.completed"] = true;
  if (defaulter) filters["tracking_db.defaulter_db.completed"] = true;
  if (recovery) filters["tracking_db.recovery_db.completed"] = true;
  if (lost) filters["tracking_db.lost_db.completed"] = true;

  if (dateFrom && dateTo) filters.date_db = { $gte: dateFrom, $lte: dateTo };

  filters.isActive_db = deactivate === true ? false : true;

  return filters;
};

const excelDownloadController = async (req, res) => {
  try {
    const { database, state, district } = req.body;
    const sheetName = state;

    let filter = {};
    filter = buildFilters(req.body); 
    let result;
    // if (district) filter.district_db = { $regex: district, $options: "i" }
    // if (state) filter.state_db = { $regex: state, $options: 'i' };
    // filter.isActive_db = true;

    if(database === "ALL"){
      const r1 = await rawDataModel.find(filter).sort({client_id:1});
      const r2 = await clientModel.find(filter).sort({client_id:1});
      const r3 = await clientSubscriptionModel.find(filter).sort({client_id:1});
      
      result = [...r1,...r2 , ...r3];
    }
    if (database === "RAW") {
      result = await rawDataModel.find(filter)
      console.log({ message: "Data found in raw db", totalCount: result.length })
    }
    if (database === "CLIENT") {
      result = await clientModel.find(filter)
      console.log({ message: "Data found in client db", totalCount: result.length })
    }
    if (database === "USER") {
      result = await clientSubscriptionModel.find(filter)
      console.log({ message: "Data found in user db", totalCount: result.length })
    }
  
   
    const plainJSON = result.map(doc => doc.toObject()); // i can also used this JSON.parse(JSON.stringify(result)) becoz it convert json string to plain object

    const ws = xlsx.utils.json_to_sheet(plainJSON, { header: Object.keys(plainJSON[0]) });
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, sheetName)
    const buffer = xlsx.write(wb, { bookType: "xlsx", type: "buffer" })

    res.setHeader(
      "Content-Disposition",
      "attachment; filename="+sheetName+".xlsx"
    )
    res.setHeader( 
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

    res.send(buffer)
  } catch (err) {
    console.log("internal error", err)
    res.status(500).json({ message: "internal error", err: err.message })
  }

};
module.exports = { excelDownloadController }