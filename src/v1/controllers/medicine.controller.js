const { OK, ERROR } = require("../../../utils/responseHelper");
const MedicineService = require("../services/medicine.service");

exports.createMedicine = async (req, res) => {
  try {
    const { name } = req.body;

    const isMedicinePresent = await MedicineService.checkMedicine(name);

    if (isMedicinePresent) return ERROR(res, null, "This medicine already exist in the record");

    const body = {
      name,
    };

    const createdMedicine = await MedicineService.createMedicine(body);

    return OK(res, { createdMedicine }, "medicine created successfully");
  } catch (error) {
    return ERROR(res, { error }, error.message || "Something went Wrong");
  }
};

exports.updateMedicine = async (req, res) => {
  try {
    const { name, isDeleted } = req.body;

    const body = {};

    if (name) body.name = name;
    if (req.body.hasOwnProperty("isDeleted")) body.isDeleted = isDeleted;

    if (!Object.keys(body).length) return ERROR(res, null, "Nothing to update");

    const medicine = await MedicineService.updateMedicine(req.params.medicineCode, body);
    return OK(res, medicine, "medicine updated successfully");
  } catch (error) {
    return ERROR(res, { error }, error.message || "Something went Wrong");
  }
};

exports.getMedicines = async (req, res) => {
  try {
    const { search, medicineCode, name } = req.query;

    const body = {};

    if (medicineCode) body.medicineCode = medicineCode;
    if (name) body.name = name;

    if (search)
      body.$or = [
        {
          name: new RegExp(search, "i"),
        },
      ];

    const medicinePresent = await MedicineService.getMedicine({ ...body }, req.query);

    return OK(res, medicinePresent, "medicines fetched successfully");
  } catch (error) {
    return ERROR(res, { error }, error.message || "Something went Wrong");
  }
};
