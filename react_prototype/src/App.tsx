import { useEffect, useState } from 'react'
import './App.css'
import VaccinationPassHeader from './components/VaccinationPassHeader/VaccinationPassHeader'
import { MIOEntry, Vaccination } from '@kbv/mioparser'
import { loadConfig } from './services/useConfig'
import {
  getMostRecentPatient,
  getRecords,
  loadXMLData,
  getPractitionerEntries,
  getDiseaseOverview,
  getVaccinationTargetDiseases,
  getConditionDisease,
} from './services/mioParser'
import DiseaseOverview from './components/DiseaseOverview/DiseaseOverview'
import DiseaseDetails from './components/DiseaseDetails/DiseaseDetails'
import { Container } from 'react-bootstrap'
import { ReactComponent as SearchLogo } from './assets/icons/search.svg'
import { ReactComponent as FilterLogo } from './assets/icons/filter.svg'

function App() {
  const [dataLoaded, setDataLoaded] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedDisease, setSelectedDisease] = useState('')
  const [patient, setPatient] = useState<Vaccination.V1_1_0.Profile.Patient | undefined>(undefined)
  const [records, setRecords] = useState<
    (
      | Vaccination.V1_1_0.Profile.RecordPrime
      | Vaccination.V1_1_0.Profile.RecordAddendum
      | Vaccination.V1_1_0.Profile.Condition
    )[]
  >([])
  const [filteredRecords, setFilteredRecords] = useState<
    (
      | Vaccination.V1_1_0.Profile.RecordPrime
      | Vaccination.V1_1_0.Profile.RecordAddendum
      | Vaccination.V1_1_0.Profile.Condition
    )[]
  >([])
  const [diseaseOverview, setDiseaseOverview] = useState<
    { targetDisease: string; lastRecord: string; recordCount: number }[]
  >([])
  const [practitionerEntries, setPractitionerEntries] = useState<
    (MIOEntry<Vaccination.V1_1_0.Profile.Practitioner> | MIOEntry<Vaccination.V1_1_0.Profile.PractitionerAddendum>)[]
  >([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedConfig = await loadConfig()
        const xmlResponse = await loadXMLData(loadedConfig.XML_DATA)
        const patientEntry = getMostRecentPatient(xmlResponse)
        setPatient(patientEntry)
        const loadedRecords = getRecords(xmlResponse)
        setRecords(loadedRecords)
        setFilteredRecords(loadedRecords)
        const newDiseaseOverview = getDiseaseOverview(loadedRecords)
        setDiseaseOverview(newDiseaseOverview)
        const practitionerEntries = getPractitionerEntries(xmlResponse)
        setPractitionerEntries(practitionerEntries)
        setDataLoaded(true)
      } catch (error) {
        console.log('Error during reading of data:', error)
      }
    }
    loadData()
  }, [])

  const recordIsForSelectedDisease = (
    record:
      | Vaccination.V1_1_0.Profile.RecordPrime
      | Vaccination.V1_1_0.Profile.RecordAddendum
      | Vaccination.V1_1_0.Profile.Condition,
    selectedDiseaseToFilter: string,
  ) => {
    if (Vaccination.V1_1_0.Profile.RecordPrime.is(record) || Vaccination.V1_1_0.Profile.RecordAddendum.is(record)) {
      return getVaccinationTargetDiseases(record).some(
        (currentTargetDisease) => currentTargetDisease === selectedDiseaseToFilter,
      )
    }
    const conditionDisease = getConditionDisease(record)
    return conditionDisease === selectedDiseaseToFilter
  }

  const handleDiseaseSelection = (newSelectedDisease: string) => {
    setSelectedDisease(newSelectedDisease)
    setFilteredRecords([...records.filter((record) => recordIsForSelectedDisease(record, newSelectedDisease))])
    setDiseaseOverview(getDiseaseOverview(filteredRecords))
  }

  return (
    <>
      {dataLoaded && (
        <div className="App">
          <VaccinationPassHeader patient={patient} />
          <Container className="mb-4">
            <div className="filter-bar d-flex align-items-center justify-content-end gap-4">
              <SearchLogo />
              <FilterLogo />
            </div>
            <div className="d-flex gap-3 align-items-start ">
              <DiseaseOverview
                diseaseOverview={diseaseOverview}
                selectedDisease={selectedDisease}
                setSelectedDisease={(newSelectedDisease: string) => handleDiseaseSelection(newSelectedDisease)}
                toggleShowDetails={() => setShowDetails(true)}
              ></DiseaseOverview>
              {showDetails && (
                <div style={{ minWidth: '490px' }}>
                  <DiseaseDetails
                    practitionerEntries={practitionerEntries}
                    records={filteredRecords}
                    toggleShowDetails={() => {
                      setShowDetails(false)
                      setSelectedDisease('')
                    }}
                  ></DiseaseDetails>
                </div>
              )}
            </div>
          </Container>
        </div>
      )}
    </>
  )
}

export default App
