# Cancer Dataset Finder — source register

Metadata reviewed on **20 November 2026**. This is a curated catalogue of **22 resources**, not 22 independent patient cohorts. No patient-level files are hosted or downloaded by this tool. Source pages and indexed primary-source records were inspected; individual data-file downloads and access approvals were not tested.

## Definitions

- **Open:** the described public data can be obtained without a project-specific data-access decision. Registration or acceptance of terms may still be required.
- **Mixed:** important data layers have different access routes, typically public processed data and controlled raw sequencing.
- **Controlled:** this entry points to a repository requiring a project-specific access decision.
- **Patients / Cell lines / Mixed:** the biological material. TISCH2 includes human and mouse studies; it is marked Mixed.
- **Bulk RNA:** bulk gene expression, including microarrays where stated; it does not imply RNA sequencing.
- Empty treatment/outcome fields mean this catalogue has not established a uniform treatment or outcome field for the resource. They do not prove absence.
- **Pan-cancer** is a broad-coverage label, not a promise that every cancer or assay is present.
- Years identify a supporting publication where established; ongoing collections use no single year.
- Access labels describe repository access, not permission for every commercial use, redistribution or model-training purpose. Check source terms.

## Overlap and interpretation

DrugComb aggregates existing screens; DepMap includes PRISM and collaborator data; TISCH2 reprocesses individual studies; TCGA and CPTAC may share specimens in some phases. Do not add sample totals across entries or treat overlapping resources as independent validation. Patient response, survival and cell-line viability are distinct endpoints. No patient counts are shown because cohorts, assay subsets and releases differ. Useful-for descriptions are proposed research uses, not predictions of clinical efficacy.

## Verification log

### Gide melanoma immunotherapy (`gide-melanoma`)

BioProject and original PubMed paper opened successfully. ENA is JavaScript rendered; accession corroborated by BioProject.

- [ENA sequencing project](https://www.ebi.ac.uk/ena/browser/view/PRJEB23709)
- [BioProject record](https://www.ncbi.nlm.nih.gov/bioproject/522397)
- [Gide et al. paper](https://pubmed.ncbi.nlm.nih.gov/30753825/)

### Riaz nivolumab cohort (`riaz-nivolumab`)

Full official GEO record and original PubMed abstract read through indexed search. Direct GEO/PubMed fetches were blocked or incomplete.

- [GEO data and downloads](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE91061)
- [Riaz et al. paper](https://pubmed.ncbi.nlm.nih.gov/29033130/)

### Hugo anti-PD-1 cohort (`hugo-melanoma`)

Full official GEO record read through indexed search; original PubMed paper opened and abstract inspected. Direct GEO fetch hit a browser check.

- [GEO data and downloads](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE78220)
- [Hugo et al. paper](https://pubmed.ncbi.nlm.nih.gov/26997480/)

### Sade-Feldman immune-cell atlas (`sade-feldman`)

Full official GEO record read through indexed search; PubMed publication metadata opened. Direct GEO fetch hit a browser check.

- [GEO data and downloads](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE120575)
- [Sade-Feldman et al. paper](https://pubmed.ncbi.nlm.nih.gov/30388456/)

### Kim lung immunotherapy cohort (`kim-nsclc`)

Full official GEO record including design and file list read through indexed search; direct fetch hit a browser check.

- [GEO data and downloads](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE135222)

### Cho lung response cohort (`cho-nsclc`)

Full official GEO record and BioProject description read through indexed search. Direct GEO fetch hit a browser check.

- [GEO data and downloads](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE126044)
- [BioProject record](https://www.ncbi.nlm.nih.gov/bioproject/520852)

### IMvigor210 molecular cohort (`imvigor210`)

EGA study opened successfully and both RNA/exome datasets inspected. Legacy Genentech package endpoint timed out, so no current open-download claim is made.

- [EGA study and access requests](https://ega-archive.org/studies/EGAS00001002556)
- [EGA access guidance](https://ega-archive.org/access/request-data/how-to-request-data/)

### SU2C–MARK lung cohort (`su2c-mark`)

dbGaP study opened successfully. Original Nature data-availability text was read in indexed search; direct Nature open failed.

- [dbGaP study and access](https://www.ncbi.nlm.nih.gov/projects/gap/cgi-bin/study.cgi?study_id=phs002822.v1.p1)
- [Original study](https://www.nature.com/articles/s41588-023-01355-5)

### Breast chemotherapy response (`breast-neoadjuvant`)

Full official GEO SuperSeries record, platform and component-study links read through indexed search.

- [GEO data and subseries](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE25066)

### Wu breast cell atlas (`wu-breast`)

Full official GEO record and file list read through indexed search. Spatial findings are a study-level layer; GEO itself lists single-cell and bulk files.

- [GEO data and study links](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE176078)

### Lee colorectal cell atlas (`lee-colorectal`)

Full official GEO record and processed-download list read through indexed search. The submitter explicitly states raw data are not provided.

- [GEO data and downloads](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE132465)

### METABRIC breast cohort (`metabric`)

EGA study opened successfully; cBioPortal indexed study results confirm the processed study. The interactive summary page returned a JavaScript shell.

- [cBioPortal study](https://www.cbioportal.org/study/summary?id=brca_metabric)
- [Original EGA archive](https://ega-archive.org/studies/EGAS00000000083)

### GENIE BioPharma Collaborative (`genie-bpc`)

AACR official data page and project GitHub access/analysis guide opened successfully.

- [Official data and cohort links](https://aacrprojectgenie.org/data/)
- [BPC access and analysis guide](https://github.com/GENIE-BPC/genieBPC/blob/main/README.Rmd)

### The Cancer Genome Atlas (`tcga`)

NCI programme and GDC access guidance opened successfully.

- [TCGA programme and data types](https://www.cancer.gov/about-nci/organization/dcb/research-programs/past-programs/tcga)
- [GDC portal](https://portal.gdc.cancer.gov/)
- [GDC access levels](https://gdc.cancer.gov/access-data/data-access-processes-and-tools)

### CPTAC proteogenomics (`cptac`)

NCI GDC project page opened successfully, including its detailed file-access table. PDC access information read from official CRDC indexed text.

- [CPTAC data overview](https://gdc.cancer.gov/about-gdc/contributed-genomic-data-cancer-research/clinical-proteomic-tumor-analysis-consortium-cptac)
- [Proteomic Data Commons](https://pdc.cancer.gov/)
- [PDC access information](https://datacommons.cancer.gov/repository/proteomic-data-commons)

### Human Tumor Atlas Network (`htan`)

Official access introduction opened successfully; detailed account/download instructions read from official indexed documentation.

- [HTAN data portal](https://data.humantumoratlas.org/explore)
- [Access levels and repositories](https://docs.humantumoratlas.org/data_access/introduction/)
- [Download and account guidance](https://docs.humantumoratlas.org/data_access/portal/)

### TISCH2 (`tisch2`)

Full official documentation and original paper data-availability text read through indexed search. Direct documentation fetch timed out.

- [TISCH2 portal](https://tisch.compbio.cn/)
- [Data documentation](https://tisch.compbio.cn/documentation/)
- [Resource paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC9825603/)

### NCI ALMANAC (`nci-almanac`)

Official NCI data page, CellMiner guide and original primary paper read through indexed search. Direct CellMiner returned 502; PMC hit a browser check.

- [NCI data downloads](https://dctd.cancer.gov/data-tools-biospecimens/data)
- [CellMiner ALMANAC guide](https://www.discover.nci.nih.gov/cellminer/html/drug_almanac_combo_score.html)
- [Original screen paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC5499996/)

### DrugComb (`drugcomb`)

University of Helsinki dataset page opened successfully; creator-deposited Zenodo file listing read through indexed search.

- [Official dataset and downloads](https://researchportal.helsinki.fi/en/datasets/drugcomb/)
- [Dose-level data release](https://zenodo.org/records/18449193)

### Genomics of Drug Sensitivity in Cancer (`gdsc`)

Official Sanger download text read through indexed search. Direct endpoint is JavaScript rendered. Official PubChem source record corroborates the GDSC terms URL.

- [GDSC downloads](https://cellmodelpassports.sanger.ac.uk/downloads/gdsc)
- [GDSC data-use terms](https://www.cancerrxgene.org/legal)

### PRISM Repurposing (`prism`)

Broad project page opened successfully; it exposes linked response tables, metadata, readmes and supplementary tables.

- [PRISM data and downloads](https://depmap.org/repurposing/)

### Cancer Dependency Map (`depmap`)

Official public-download documentation and Broad forum dataset guide read through indexed search. Direct data portal displayed a human-verification page.

- [DepMap public data](https://depmap.org/portal/data_page/)
- [Official dataset guide](https://forum.depmap.org/t/depmap-portal-datasets/3695)

