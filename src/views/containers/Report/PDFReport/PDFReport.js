import React, { Fragment, useState, useContext, useEffect } from 'react'
import uuidv1 from 'uuid/v1'

import {
  GET_REPORT_PDF,
  SEND_ONE_REPORT,
  GET_ONE_REPORT } from '../../../../config/utils/constants'

import { Content, Line, Header, Row, Box, Text, Button } from './PDFReportStyle'
import { LoadedPageContext } from '../../../store'

const PDFReport = ({match: {params: {id}}, history}) => {
  const [report, setReport] = useState()
  const [isReportLoading, setIsReportLoading] = useState(true)

  const { setIsPrintPage } = useContext(LoadedPageContext)

  const electron = window.require('electron')
  const ipc = electron.ipcRenderer

  function fetchData(){
    ipc.send(SEND_ONE_REPORT, id)

    ipc.on(GET_ONE_REPORT, (event, arg) =>{
      const report = JSON.parse(arg.data)

      setReport(report)
      setIsReportLoading(false)
      calcTotalTime(report.pieces, report.workers)
    })
  }

  const [ isCalcTimeLoading, setIsCalcTimeLoading ] = useState(true)
  const [ amountTotalTime, setAmountTotalTime ] = useState()
  const [ piecesTotalTime, setPiecesTotalTime ] = useState()
  const [ amountPiecesTotalTime, setAmountPiecesTotalTime ] = useState()
  const [ totalProductionTime, setTotalProductionTime ] = useState()
  function calcTotalTime(pieces, workers){
    const amountTotalTime = pieces.map(({piece, amount}) =>{
      return{
        hours: (piece.totalTime.hours * amount) + Math.floor((piece.totalTime.minutes * amount)/60) +  Math.floor((((piece.totalTime.seconds * amount)/60)/60)),
        minutes: (((piece.totalTime.minutes * amount)% 60) + Math.floor((piece.totalTime.seconds * amount)/60))%60,
        seconds: (piece.totalTime.seconds * amount)%60
      }
    })

    setAmountTotalTime(amountTotalTime)


    const piecesTotalTime = pieces.map(({piece})=>{
      return{
        hours: piece.totalTime.hours + Math.floor(piece.totalTime.minutes/60),
        minutes: piece.totalTime.minutes% 60 + Math.floor(piece.totalTime.seconds/60),
        seconds: piece.totalTime.seconds%60
      }
    })

    const totalPieceHours =  piecesTotalTime.reduce((prev, {hours})=>{
      return prev + hours
    }, 0)

    const totalPieceMinutes =  piecesTotalTime.reduce((prev, {minutes})=>{
      return prev + minutes
    }, 0)

    const totalPieceSeconds =  piecesTotalTime.reduce((prev, {seconds})=>{
      return prev + seconds
    }, 0)

    setPiecesTotalTime({
      hours: totalPieceHours,
      minutes: totalPieceMinutes,
      seconds: totalPieceSeconds
    })


    const totalAmountPieceHours =  amountTotalTime.reduce((prev, {hours})=>{
      return prev + hours
    }, 0)

    const totalAmountPieceMinutes =  amountTotalTime.reduce((prev, {minutes})=>{
      return prev + minutes
    }, 0)

    const totalAmountPieceSeconds =  amountTotalTime.reduce((prev, {seconds})=>{
      return prev + seconds
    }, 0)

    setAmountPiecesTotalTime({
      hours: totalAmountPieceHours + Math.floor(totalAmountPieceMinutes/60),
      minutes: (totalAmountPieceMinutes % 60) + Math.floor(totalAmountPieceSeconds/60) ,
      seconds: totalAmountPieceSeconds % 60
    })

    const totalProductionHours = Math.floor((totalAmountPieceHours + Math.floor(totalAmountPieceMinutes/60))/workers)
    const totalProductionMinutes = Math.floor(Math.floor(((totalAmountPieceMinutes % 60) + Math.floor(totalAmountPieceSeconds/60) % 60)/workers) +  ((((totalAmountPieceHours + Math.floor(totalAmountPieceMinutes/60)) * 60) / workers)%60))
    //const totalProductionMinutes = Math.floor(((totalAmountPieceMinutes % 60) + Math.floor(totalAmountPieceSeconds/60))/workers) + ((totalAmountPieceHours + Math.floor(totalAmountPieceMinutes/60))%60) + Math.round(((totalAmountPieceSeconds % 60) / workers) )
    const totalProductionSeconds = Math.round(((totalAmountPieceSeconds % 60) / workers) + ((((totalAmountPieceHours + Math.floor(totalAmountPieceMinutes/60)) * 60) / workers)%60))
    //const totalProductionSeconds = (Math.round(((totalAmountPieceSeconds % 60)) ) +  (Math.floor(((totalAmountPieceMinutes % 60) + Math.floor(totalAmountPieceSeconds/60) % 60)/workers) +  ((((totalAmountPieceHours + Math.floor(totalAmountPieceMinutes/60)) * 60) / workers)%60))%60)/workers


    setTotalProductionTime({
      hours: totalProductionHours,
      minutes: totalProductionMinutes,
      seconds: totalProductionSeconds
    })

    setIsCalcTimeLoading(false)
  }

  useEffect(()=>{
    fetchData()
  },[])
  return (
    <Fragment>
      {isReportLoading
        ? <div>
          <h1>Carregando o Documento...</h1>
        </div>
        :<Fragment>
              <Content>
                <Header>
                  <Text bold> Relatório: {report.name} </Text>
                </Header>
              </Content>
              { report.pieces.map(({piece, amount}, index) =>(
                <Content key={uuidv1()}>
                  <Header>
                    <Text bold> Peça: {piece.name} - Quantidade: {amount} </Text>
                  </Header>
                  <Line/>
                  <Row>
                    <Box size={5}>
                      <Text></Text>
                    </Box>
                    <Box size={15}>
                      <Text  bold>Máquina</Text>
                    </Box>
                    <Box size={30}>
                      <Text bold>Especificação das Etapas</Text>
                    </Box>
                    <Box size={25}>
                      <Text bold>Tempo/Unidade</Text>
                    </Box>
                    <Box size={25} final>
                      <Text bold>Tempo/Quantidade</Text>
                    </Box>
                  </Row>
                  { piece.steps.map((step, index) =>(
                    <Fragment key={uuidv1()}>
                      <Line/>
                      <Row>
                        <Box size={5}>
                          <Text bold>{step.step}</Text>
                        </Box>
                        <Box size={15}>
                          <Text>{step.machine}</Text>
                        </Box>
                        <Box size={30}>
                          <Text>{step.description}</Text>
                        </Box>
                        <Box size={25}>
                          <Text>
                            {step.minutes}m, {step.seconds}s.
                          </Text>
                        </Box>
                        <Box size={25} final>
                          <Text>
                            { Math.floor(((step.minutes * amount) +  Math.floor((step.seconds * amount)/60))/60) > 0
                            && Math.floor(((step.minutes * amount) +  Math.floor((step.seconds * amount)/60))/60)
                            }
                            { Math.floor(((step.minutes * amount) +  Math.floor((step.seconds * amount)/60))/60) < 1
                              ? ''
                              : 'h, '
                            }


                            { Math.floor((Math.floor(((step.minutes * amount) +  Math.floor((step.seconds * amount)/60))%60) + Math.floor((step.seconds * amount)/60))%60) + 'm, ' }

                            { (step.seconds * amount) % 60 + 's.' }
                          </Text>
                        </Box>
                      </Row>
                    </Fragment>
                  ))}
                  <Line/>
                  <Row >
                    <Box size={5} final>
                      <Text></Text>
                    </Box>
                    <Box size={15} final>
                      <Text></Text>
                    </Box>
                    <Box size={30}>
                      <Text></Text>
                    </Box>
                    <Box size={25}>
                      <Text bold>Tempo Total:{' '}
                        {piece.totalTime.hours > 0 && piece.totalTime.hours}{piece.totalTime.hours === 1 ? ' h, ' : piece.totalTime.hours > 1 ? ' h, ' : ''}
                        {piece.totalTime.minutes}m,{' '}
                        {piece.totalTime.seconds}s.
                      </Text>
                    </Box>
                    <Box size={25} final>
                      <Text bold>Tempo Total:{' '}
                        {
                          isCalcTimeLoading
                          ? null
                          : <Fragment>
                              {amountTotalTime[index].hours > 0 && amountTotalTime[index].hours} {amountTotalTime[index].hours > 0? (amountTotalTime[index].hours > 1? 'h, ': 'h, '): ''}
                              {amountTotalTime[index].minutes}m,{' '}
                              {amountTotalTime[index].seconds}s.
                            </Fragment>
                        }
                      </Text>
                    </Box>
                  </Row>
                </Content>
              ))
              }


              <Content>
                <Row>
                  <Box size={50}>
                    <Text bold>
                      {
                        isCalcTimeLoading
                        ? null
                        : <div>
                            Tempo Total de Produção/Unidade:{' '}
                            {piecesTotalTime.hours > 0 && piecesTotalTime.hours}
                            {piecesTotalTime.hours < 1 ? '': piecesTotalTime.hours > 1? 'h, ': 'h, '}
                            {piecesTotalTime.minutes}m{' '}
                            {piecesTotalTime.seconds}s.
                          </div>
                      }

                    </Text>
                  </Box>
                  <Box size={50} final>
                    <Text bold>
                      {
                        isCalcTimeLoading
                        ? null
                        : <div>
                            Tempo Total de Produção/Quantidade:{' '}
                            {amountPiecesTotalTime.hours > 0 && amountPiecesTotalTime.hours}
                            {amountPiecesTotalTime.hours < 1 ? '': amountPiecesTotalTime.hours > 1? 'h, ': 'h, '}
                            {amountPiecesTotalTime.minutes}m,{' '}
                            {amountPiecesTotalTime.seconds}s.
                          </div>
                      }
                    </Text>
                  </Box>
                </Row>
                <Line/>
                <Row>
                  <Box size={50}>
                    <Text bold>
                      Quantidade de Trabalhadores: {report.workers}
                    </Text>
                  </Box>
                  <Box size={50} final>
                    <Text bold>
                      {
                        isCalcTimeLoading
                        ? null
                        : <div>
                            Tempo Total de Produção/Trabalhador:{' '}
                            {totalProductionTime.hours}h,  {Math.round(totalProductionTime.minutes)}m, {Math.round(totalProductionTime.seconds)}s.
                          </div>
                      }
                    </Text>
                  </Box>
                </Row>
              </Content>
              <Button>
                <button
                  onClick={()=> window.print()}
                  style={{marginRight: '10px'}}
                  className="button secondary outline mr-6"
                >
                <span className="mif-printer"></span>  Imprimir
                </button>
              </Button>
        </Fragment>
      }
    </Fragment>
  )
}

export default PDFReport;
