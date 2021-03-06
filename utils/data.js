import data_scripps from "../data/scripps.json";
import data_pomona from "../data/pomona.json";
import data_cmc from "../data/cmc.json";
import data_hmc from "../data/hmc.json";
import data_pitzer from "../data/pitzer.json";

export const allData = {
    scripps: data_scripps,
    pomona: data_pomona,
    cmc: data_cmc,
    hmc: data_hmc,
    pitzer: data_pitzer,
}

export const tAndCLabels = ["tuition", "la", "nat", "ca", "hepi"];

export const aggLabels = ["rev_cleaned", "rev_all", "rev_wo_gifts", "exp_all", "cost_on_aid", "perc_on_aid"];

export const expCats = {
    academic: ["exp_instruction", "exp_research", "exp_academic_support", "exp_academic"],
    cocurricular: ["exp_cocurricular", "exp_student_services", "exp_auxiliary_enterprises"],
    institutional: ["exp_admin", "exp_marketing", "exp_institutional_support"],
}

export const schoolLabels = {
    scripps: "Scripps",
    pomona: "Pomona",
    cmc: "Claremont McKenna",
    hmc: "Harvey Mudd",
    pitzer: "Pitzer",
}

export const dataLabels = {
    rev_other: "Other revenue",
    rev_students: "Net student revenue",
    rev_endowment: "Endowment income",
    rev_contributions: "Donations and grants",
    exp_instruction: "Instruction",
    exp_research: "Research",
    exp_service: "Public service",
    exp_academic_support: "Academic support",
    exp_student_services: "Student services",
    exp_institutional_support: "Institutional support",
    exp_auxiliary_enterprises: "Auxiliary enterprises",
    exp_academic: "Academic program",
    exp_cocurricular: "Co-curricular program",
    exp_marketing: "Marketing",
    exp_admin: "General and Administrative",
    tuition: "Tuition",
    la: "LA County CPI",
    nat: "National CPI",
    ca: "California CPI",
    hepi: "Higher Education Price Index",
    rev_cleaned: "Revenue without stu. rev. or gifts",
    rev_all: "Total revenue",
    rev_wo_gifts: "Revenue without gifts",
    enrollment: "Enrollment",
    finaid: "Financial aid",
    academic: "Academics",
    cocurricular: "Co-curricular",
    institutional: "Institutional",
    exp_all: "Total expenses",
    exp_per_student: "Expenses per student",
    num_on_aid: "Number of students awarded financial aid",
    cost_on_aid: "Average cost of attendance for students awarded aid",
    perc_on_aid: "Percentage of students awarded financial aid",
    ...schoolLabels,
}