import React, { FC, useState } from 'react'
import './DiseaseOverview.scss'

import Table from 'react-bootstrap/Table'
import { Card } from 'react-bootstrap'

interface DiseaseOverviewProps {
  diseaseOverview: {
    targetDisease: string
    lastRecord: string
    recordCount: number
  }[]
  toggleShowDetails: () => void
}

const DiseaseOverview: FC<DiseaseOverviewProps> = (props: DiseaseOverviewProps) => {
  const [sortMode, setSortMode] = useState('lastRecord')
  const [sortModeReversed, setSortModeReversed] = useState(false)
  const [diseaseOverview, setDiseaseOverview] = useState(props.diseaseOverview)
  const [selectedDisease, setSelectedDisease] = useState('')

  const getDropdownIcon = (column: string) => {
    if (column === sortMode && sortModeReversed) {
      return (
        <div className="d-flex flex-column sort-icon-container justify-content-between">
          <img src="/assets/icons/arrow_drop_up_active.svg" alt="Pfeil nach oben"></img>
          <img src="/assets/icons/arrow_drop_down_inactive.svg" alt="Pfeil nach unten"></img>
        </div>
      )
    }
    if (column === sortMode && !sortModeReversed) {
      return (
        <div className="d-flex flex-column sort-icon-container justify-content-between">
          <img src="/assets/icons/arrow_drop_up_inactive.svg" alt="Pfeil nach oben"></img>
          <img src="/assets/icons/arrow_drop_down_active.svg" alt="Pfeil nach unten"></img>
        </div>
      )
    }
    return (
      <div className="d-flex flex-column sort-icon-container justify-content-between">
        <img src="/assets/icons/arrow_drop_up_inactive.svg" alt="Pfeil nach oben"></img>
        <img src="/assets/icons/arrow_drop_down_inactive.svg" alt="Pfeil nach unten"></img>
      </div>
    )
  }

  const handleSetSortMode = (newSortMode: string) => {
    const newDiseaseOverview = [...diseaseOverview]
    if (newSortMode === sortMode) {
      newDiseaseOverview.reverse()
      setSortModeReversed(!sortModeReversed)
    } else {
      setSortModeReversed(false)
      newDiseaseOverview.sort((a, b) => {
        switch (newSortMode) {
          case 'lastRecord':
            return new Date(b.lastRecord).getTime() - new Date(a.lastRecord).getTime()
          case 'recordCount':
            return b.recordCount - a.recordCount
          case 'targetDisease':
            return a.targetDisease.localeCompare(b.targetDisease)
          default:
            return 0
        }
      })
    }
    setSortMode(newSortMode)
    setDiseaseOverview(newDiseaseOverview)
  }

  return (
    <div className="DiseaseOverview flex-grow-1" data-testid="DiseaseOverview">
      <Card>
        <Card.Body>
          <Table hover className="condition-table">
            <thead>
              <tr className="table-head">
                <th role="button" className="col-4" onClick={() => handleSetSortMode('targetDisease')}>
                  <div className="text-bottom">
                    Impfrelevante Krankheiten
                    {getDropdownIcon('targetDisease')}
                  </div>
                </th>
                <th role="button" className="col-2" onClick={() => handleSetSortMode('lastRecord')}>
                  <div className="text-bottom">
                    Letzter Eintrag
                    {getDropdownIcon('lastRecord')}
                  </div>
                </th>
                <th role="button" className="col-2" onClick={() => handleSetSortMode('recordCount')}>
                  <div className="text-bottom">
                    Einträge
                    {getDropdownIcon('recordCount')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {diseaseOverview.map((disease) => (
                <tr
                  className={disease.targetDisease === selectedDisease ? 'selected' : ''}
                  role="button"
                  key={disease.targetDisease}
                  onClick={() => {
                    setSelectedDisease(disease.targetDisease)
                    props.toggleShowDetails()
                  }}
                >
                  <td className="col-4">{disease.targetDisease}</td>
                  <td className="col-2">{new Date(disease.lastRecord).toLocaleDateString()}</td>
                  <td className="col-2">{disease.recordCount}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  )
}

export default DiseaseOverview
