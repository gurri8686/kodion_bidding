import * as Yup from "yup";

export const registerSchema = Yup.object({
  firstname: Yup.string().trim().required("First name is required"),
  lastname: Yup.string().trim().required("Last name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters long")
    .required("Password is required"),
});

export const loginSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export const filterSchema = Yup.object().shape({
  hourlyMinRate: Yup.number()
    .min(0, 'Min must be >= 0')
    .lessThan(Yup.ref('hourlyMaxRate'), 'Min rate must be less than max'),
  hourlyMaxRate: Yup.number()
    .moreThan(Yup.ref('hourlyMinRate'), 'Max rate must be greater than min'),
});

export const appliedJobSchema = Yup.object().shape({
  bidderName: Yup.string().required("Bidder name is required"),
  profileId: Yup.string().required("Profile is required"),
  technologies: Yup.array()
    .of(Yup.string())
    .min(1, "At least one technology is required")
    .required("Technologies are required")
    .nullable(),
  connects: Yup.number()
    .typeError("Must be a number")
    .required("Connects used is required")
    .default(0),
  proposalLink: Yup.string().required("Proposal link is required"),
});

export const editJobSchema = Yup.object().shape({
  manualJobTitle: Yup.string().required("Please enter the job title"),
  profileId: Yup.number().required("Please select a profile"),
  technologies: Yup.array()
    .of(Yup.string())
    .min(1, "At least one technology is required")
    .required("Technologies are required"),
  proposalLink: Yup.string().required("Please provide the proposal link"),
  manualJobUrl: Yup.string().required("Please provide the Upwork job URL"),
  connectsUsed: Yup.number()
    .typeError("Must be a number")
    .required("Connects used is required")
    .min(0, "Must be at least 0"),
});

export const applyManualJobSchema = Yup.object().shape({
  bidderName: Yup.string().required("Please enter the bidder's name"),
  jobTitle: Yup.string().required("Please enter the job title"),
  upworkJobUrl: Yup.string().required("Please provide the Upwork job URL"),
  profileId: Yup.string().required("Please select a profile"),
  technologies: Yup.array()
    .of(Yup.string())
    .min(1, "Select at least one technology"),
  connects: Yup.number()
    .transform((value: any, originalValue: any) =>
      originalValue === "" ? undefined : value
    )
    .typeError("Connects must be a number")
    .required("Enter the number of connects used"),
  proposalLink: Yup.string().required("Please provide the proposal link"),
});

export const addDeveloperSchema = Yup.object().shape({
  name: Yup.string()
    .matches(/^[a-zA-Z ]{2,30}$/, "Name must be 2-30 characters and only letters")
    .required("Name is required"),
  email: Yup.string()
    .email("Invalid email format"),
  contact: Yup.string()
    .matches(/^\d{10}$/, "Contact must be a valid 10-digit number"),
});

export const hiredJobSchema = Yup.object({
  selectedDeveloper: Yup.string().required("Please select a developer."),
  hiredDate: Yup.string().required("Please select the hired date."),
  ClientName: Yup.string().required("Client name is required."),
  budgetType: Yup.string().required("Please select a budget type."),
  budgetAmount: Yup.number()
    .typeError("Budget amount must be a number.")
    .required("Please enter a budget amount.")
    .positive("Budget amount must be a positive number."),
  notes: Yup.string().max(500, "Notes must be 500 characters or less."),
});
