import data_scripps from "../data/scripps.json" assert {type: "json"};
import data_pomona from "../data/pomona.json" assert {type: "json"};
import data_cmc from "../data/cmc.json" assert {type: "json"};
import data_hmc from "../data/hmc.json" assert {type: "json"};
import data_pitzer from "../data/pitzer.json" assert {type: "json"};

export const allData = {
    scripps: data_scripps,
    pomona: data_pomona,
    cmc: data_cmc,
    hmc: data_hmc,
    pitzer: data_pitzer,
}

export const tAndCLabels = ["tuition", "la", "nat", "ca", "hepi", "rev_cleaned", "rev_all"];

export const dataLabels = {
    rev_other: "Other revenue*",
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
}

export const schoolLabels = {
    scripps: "Scripps College",
    pomona: "Pomona College",
    cmc: "Claremont McKenna College",
    hmc: "Harvey Mudd College",
    pitzer: "Pitzer College",
}