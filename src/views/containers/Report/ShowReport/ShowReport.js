import React, {Fragment, useState, useContext, useEffect} from 'react'
import {Link} from 'react-router-dom'
import Notifications, {notify} from 'react-notify-toast'
import {confirmAlert} from "react-confirm-alert"


import {
  IMAGE_URL,
  SEND_ONE_REPORT,
  GET_ONE_REPORT,
  SEND_DELETE_REPORT,
  GET_DELETE_REPORT,
  SEND_REPORT_PDF } from '../../../../config/utils/constants';


import { Container, Box, Title, Content, Row } from '../../../components/UI/Commons'

import {Wrapper, ReportTableHeader, ReportTableTitle, ReportTableRow} from './ShowReportStyle'

import { LoadedPageContext } from '../../../store'


const ShowReport = ({location: {state}, history}) => {
  const { setIsLoadedPage, setLoadingMessage }  = useContext(LoadedPageContext)

  const [report, setReport] = useState()
  const [isReportLoading, setIsReportLoading] = useState(true)

  const electron = window.require('electron')
  const ipc = electron.ipcRenderer


  function fetchData() {
    try {
      ipc.send(SEND_ONE_REPORT, state)

      ipc.on(GET_ONE_REPORT, (event, arg) =>{
        const data = JSON.parse(arg.data)


        setReport(data)

        calcTotalTime(data.pieces, data.workers)
        setIsReportLoading(false)
      })


    } catch (error) {

    }
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

    setIsCalcTimeLoading(!isCalcTimeLoading)
  }

  function handleDelete() {
    confirmAlert({
      title: 'Remover Relatório',
      message: 'Tem certeza que deseja remover este relatório?',
      buttons: [
        {
          label: 'Sim',
          onClick: async () => {
            await deleteReport()
            history.push('/lista-relatorios')
          }
        },
        {
          label: 'Não',
          onClick: () => {}
        }
      ]
    })
  }

  function deleteReport(){
    try{
      ipc.send(SEND_DELETE_REPORT, state)

      ipc.on(GET_DELETE_REPORT, (event, arg) =>{
        const report = JSON.parse(arg.data)

        notify.show(report, 'success', 2000, )
      })
    }catch(error){
      notify.show(error.response.data.message, 'error', 2000)

    }
  }


  useEffect(() => {
    fetchData()
  }, [])



  return (
    <Wrapper>
      <Notifications/>
      <Container>
        <Box title>
          <Title>
            Relatório
          </Title>
        </Box>
        {
          isReportLoading
          ? <div data-role="progress" data-type="line"></div>
          : <Fragment>
              <Box>
                <Content>
                <ReportTableHeader center className='mt-6'>
                  <Title>
                    Relatório - {report.name}
                  </Title>
                </ReportTableHeader>

                {report.pieces.map(({piece, amount}, index) => (
                  <Fragment key={piece._id}>
                    <ReportTableHeader piece>
                      <div>
                        <Title>
                          Peça: {piece.name}
                        </Title>
                        <Title>
                          Quantidade: {amount}
                        </Title>
                      </div>

                      <img
                        height={100}
                        width={100}
                        src={IMAGE_URL+piece.image} alt=""
                      />
                    </ReportTableHeader>

                    <ReportTableTitle>
                      <div>
                        Etapa
                      </div>
                      <div>
                        Máquina
                      </div>
                      <div>
                        Descrição
                      </div>
                      <div>
                        Tempo de Produção Unitário
                      </div>
                      <div>
                        Tempo de Produção Total por Peças
                      </div>
                    </ReportTableTitle>

                    {piece.steps.map((piece, index) => (
                      <ReportTableRow key={index}>
                        <div>
                          <strong>{piece.step}</strong>
                        </div>
                        <div>
                          {piece.machine}
                        </div>
                        <div>
                          {piece.description}
                        </div>
                        <div>
                          {piece.minutes} {piece.minutes > 1 ? ' minutos  e ' : ' minuto e '}
                          {piece.seconds} {piece.seconds > 1 ? ' segundos.' : ' segundo '}
                        </div>
                        <div>
                          { Math.floor(((piece.minutes * amount) +  Math.floor((piece.seconds * amount)/60))/60) > 0
                          && Math.floor(((piece.minutes * amount) +  Math.floor((piece.seconds * amount)/60))/60)
                          }
                          { Math.floor(((piece.minutes * amount) +  Math.floor((piece.seconds * amount)/60))/60) < 1
                            ? ''
                            : Math.floor(((piece.minutes * amount) +  Math.floor((piece.seconds * amount)/60))/60) > 1
                              ? ' horas, '
                              : ' hora, '
                          }

                          { Math.floor((Math.floor(((piece.minutes * amount) +  Math.floor((piece.seconds * amount)/60))%60) + Math.floor((piece.seconds * amount)/60))%60) }

                          { Math.floor((Math.floor(((piece.minutes * amount) +  Math.floor((piece.seconds * amount)/60))%60) + Math.floor((piece.seconds * amount)/60))%60) > 1
                            ? ' minutos e '
                            : ' minutos e '
                          }

                          { (piece.seconds * amount) % 60 }
                          { (piece.seconds * amount) % 60 > 1
                            ? ' segundos.'
                            :' segundo.'
                          }

                        </div>
                      </ReportTableRow>
                    ))}
                    <ReportTableRow>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div>
                        <strong>Tempo Total: </strong>
                        {piece.totalTime.hours > 0 && piece.totalTime.hours}{piece.totalTime.hours === 1 ? ' hora, ' : piece.totalTime.hours > 1 ? ' horas, ' : ''}
                        {piece.totalTime.minutes}{piece.totalTime.minutes > 1 ? ' minutos e ' : ' minuto e '}
                        {piece.totalTime.seconds}{piece.totalTime.seconds > 1 ? ' segundos.' : ' segundo.'}
                      </div>
                      <div>
                        <strong>Tempo Total: </strong>
                        { isCalcTimeLoading
                          ? null
                          : <div>
                            {amountTotalTime[index].hours > 0 && amountTotalTime[index].hours} {amountTotalTime[index].hours > 0? (amountTotalTime[index].hours > 1? ' horas, ': ' hora, '): ''}
                            {amountTotalTime[index].minutes} {amountTotalTime[index].minutes > 1? ' minutos e ': ' minito e '}
                            {amountTotalTime[index].seconds} {amountTotalTime[index].seconds > 1? ' segundos.': ' segudo.'}
                          </div>
                        }


                      </div>
                    </ReportTableRow>
                  </Fragment>
                ))}
                <ReportTableRow result='true'>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div>
                    <strong>Tempo Total: </strong>
                    { isCalcTimeLoading
                      ? null
                      : <div>
                        {piecesTotalTime.hours > 0 && piecesTotalTime.hours}
                        {piecesTotalTime.hours < 1 ? '': piecesTotalTime.hours > 1? ' horas, ': ' hora, '}
                        {piecesTotalTime.minutes} {piecesTotalTime.minutes > 1? ' minutos e ': ' minuto e '}
                        {piecesTotalTime.seconds} {piecesTotalTime.seconds > 1? ' segundos.': ' segundo.'}
                      </div>
                    }

                  </div>
                  <div>
                    <strong>Tempo Total: </strong>
                    { isCalcTimeLoading
                      ? null
                      : <div>
                        {amountPiecesTotalTime.hours > 0 && amountPiecesTotalTime.hours}
                        {amountPiecesTotalTime.hours < 1 ? '': amountPiecesTotalTime.hours > 1? ' horas, ': ' hora, '}
                        {amountPiecesTotalTime.minutes} {amountPiecesTotalTime.minutes > 1? ' minutos e ': ' minuto e '}
                        {amountPiecesTotalTime.seconds} {amountPiecesTotalTime.seconds > 1? ' segundos.': ' segundo.'}
                      </div>
                    }

                  </div>
                </ReportTableRow>

                <ReportTableRow result>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div>
                    <strong>Quantidade de trabalhadores: </strong>
                    {report.workers}
                  </div>
                  <div>
                    <strong> Tempo total de Produção: </strong>
                    {isCalcTimeLoading
                      ? null
                      : <div>
                        {totalProductionTime.hours}
                        {totalProductionTime.hours === 1 ? ' hora, ' : ' horas, '}

                        {totalProductionTime.minutes}
                        {totalProductionTime.minutes > 1 ? ' minutos e ' : ' minutos e '}

                        {totalProductionTime.seconds}
                        {totalProductionTime.seconds > 1 ? ' segundos.' : ' segundos.'}
                      </div>
                    }

                  </div>
                </ReportTableRow>
              </Content>
              </Box>
              <Box>
                <Row>
                  <div></div>
                  <div
                    style={{marginLeft: 'auto'}}
                  >
                    <Link to={`/pdf-relatorio/${state}`}>
                      <button className="button dark outline drop-shadow mr-6">
                        <span className="mif-printer"></span> Gerar Documento
                      </button>
                    </Link>

                    <Link to={{pathname:'/editar-relatorio', state}}>
                      <button className='button secondary drop-shadow mr-6'>
                        <span className="mif-pencil"></span>  Editar
                      </button>
                    </Link>

                    <button className='button alert drop-shadow'
                      onClick={handleDelete}
                    >
                      <span className="mif-bin"></span> Remover
                    </button>
                  </div>
                </Row>
              </Box>
            </Fragment>
        }
      </Container>
    </Wrapper>
  )
}

export default ShowReport
