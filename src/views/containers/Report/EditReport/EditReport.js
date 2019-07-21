import React, { Fragment, useState, useEffect } from 'react'
import { withFormik, Field, ErrorMessage } from 'formik'
import Highlight from 'react-highlighter'
import * as Yup from 'yup'
import Notifications, {notify} from 'react-notify-toast'

import {
  IMAGE_URL,
  SEND_ALL_PIECES,
  GET_ALL_PIECES,
  SEND_DELETE_REPORT,
  GET_DELETE_REPORT,
  SEND_UPDATE_REPORT,
  GET_UPDATE_REPORT,
  SEND_ONE_REPORT,
  GET_ONE_REPORT,
  SEND_CREATE_REPORT,
  GET_CREATE_REPORT } from '../../../../config/utils/constants';


import { Container, Box, Title, Content, Row } from '../../../components/UI/Commons'

import {
  Wrapper,
  ReportList,
  ReportHeader,
  ReportTitle,
  ReportRow,
  ReportItem,
  ReportTableHeader,
  ReportTableTitle,
  ReportTableRow } from './EditReportStyle'
import {confirmAlert} from "react-confirm-alert";

const EditReport = ({ location: {state}, history,
                      values, handleChange, setFieldValue, handleSubmit
                    }) => {

  const [ isPiecesLoading, setIsPiecesLoading ] = useState(true)
  const [ pieces, setPieces ] = useState([])

  const electron = window.require('electron')
  const ipc = electron.ipcRenderer


  function loadPieces(name = '', page = 1, limit = 5){
    ipc.send(SEND_ALL_PIECES, {name, page, limit})

    ipc.on(GET_ALL_PIECES, (event, arg) =>{
      const pieces = JSON.parse(arg.data)

      setPieces(pieces)
      setIsPiecesLoading(false)
    })
  }


  const [ isReportDataLoading, setIsReportDataLoading ] = useState(true)
  const [ reportData, setReportData ] = useState([])

  async function loadReport() {
    try {
      ipc.send(SEND_ONE_REPORT, state)

      values.id = state

      ipc.on(GET_ONE_REPORT, (event, arg) =>{
        const report = JSON.parse(arg.data)

        report.pieces.map(({piece, amount})=>{
          addReportPiece(piece, amount)
        })

        calcTotalTime()

        values.workers = report.workers

        setReportData(report)
        setIsReportDataLoading(false)
      })
    } catch (error) {

    }
  }



  const [ report, setReport ] = useState([])
  const [ piecesTime, setPiecesTime ] = useState([])
  const [ amountPiecesTime, setAmountPiecesTime ] = useState([])
  const [ isAddPiece, setIsAddPiece ] = useState(false)

  function addReportPiece(piece, amount){
    const amountPiecesTimeVar = {
      hours: (piece.totalTime.hours * amount) + Math.floor((piece.totalTime.minutes * amount)/60) +  Math.floor((((piece.totalTime.seconds * amount)/60)/60)),
      minutes: (((piece.totalTime.minutes * amount)% 60) + Math.floor((piece.totalTime.seconds * amount)/60))%60,
      seconds: (piece.totalTime.seconds * amount)%60
    }

    values.report.pieces.push({
      piece,
      amount,
      totalTime: amountPiecesTimeVar
    })

    setReport([...values.report.pieces])


    setPiecesTime([
      ...piecesTime,
      {
        hours: (piece.hours * amount) + Math.floor((piece.minutes * amount)/60),
        minutes: (piece.minutes * amount)% 60 + Math.floor((piece.seconds * amount)/60),
        seconds: (piece.seconds * amount)%60
      }
    ])

    values.piecesTime = [
      ...values.piecesTime,
      {
        hours: piece.totalTime.hours + Math.floor(piece.totalTime.minutes/60),
        minutes: piece.totalTime.minutes% 60 + Math.floor(piece.totalTime.seconds/60),
        seconds: piece.totalTime.seconds%60
      }
    ]

    setAmountPiecesTime([
      ...amountPiecesTime,
      amountPiecesTimeVar
    ])

    values.amountPiecesTime = [
      ...values.amountPiecesTime,
      amountPiecesTimeVar
    ]

    setIsAddPiece(!isAddPiece)
  }


  const [ isPieceRemoved, setIsPieceRemoved ] = useState(false)
  function removeReportPiece(index){

    values.report.pieces.splice(index, 1)
    setReport([...values.report.pieces])

    values.amountPiecesTime.splice(index, 1)

    values.piecesTime.splice(index, 1)

    setIsPieceRemoved(!isPieceRemoved)
  }


  const [ piecesTotalTime, setPiecesTotalTime ] = useState()
  const [ piecesAmountTime, setPiecesAmountTime ] = useState()
  function calcTotalTime(){
    const totalHours =  values.piecesTime.reduce((prev, {hours})=>{
      return prev + hours
    }, 0)

    const totalMinutes =  values.piecesTime.reduce((prev, {minutes})=>{
      return prev + minutes
    }, 0)

    const totalSeconds =  values.piecesTime.reduce((prev, {seconds})=>{
      return prev + seconds
    }, 0)

    setPiecesTotalTime(
      {
        hours: totalHours + Math.floor(totalMinutes/60),
        minutes: (totalMinutes % 60) + Math.floor(totalSeconds/60),
        seconds: totalSeconds % 60
      }
    )


    const totalAmountHours =  values.amountPiecesTime.reduce((prev, {hours})=>{
      return prev + hours
    }, 0)

    const totalAmountMinutes =  values.amountPiecesTime.reduce((prev, {minutes})=>{
      return prev + minutes
    }, 0)

    const totalAmountSeconds =  values.amountPiecesTime.reduce((prev, {seconds})=>{
      return prev + seconds
    }, 0)

    setPiecesAmountTime(
      {
        hours: totalAmountHours + Math.floor(totalAmountMinutes/60),
        minutes: (totalAmountMinutes % 60) + Math.floor(totalAmountSeconds/60),
        seconds: totalAmountSeconds % 60
      }
    )

    values.piecesAmountTime = {
      hours: totalAmountHours + Math.floor(totalAmountMinutes/60),
      minutes: (totalAmountMinutes % 60) + Math.floor(totalAmountSeconds/60),
      seconds: totalAmountSeconds % 60
    }
    calcProductionTime()
  }

  const [ productionTime, setProductionTime ] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  })
  function calcProductionTime(){
    if(piecesAmountTime){
      const hours = Math.floor(values.piecesAmountTime.hours / values.workers)
      const minutes = Math.floor(values.piecesAmountTime.minutes / values.workers) + (((values.piecesAmountTime.hours * 60) / values.workers)%60)
      const seconds = Math.round((values.piecesAmountTime.seconds / values.workers) + (((values.piecesAmountTime.hours * 60) / values.workers)%60))

      setProductionTime({
        hours,
        minutes,
        seconds
      })
    }
  }

  const [ page, setPage ] = useState(1)

  const [ limit, setLimit ] = useState(5)
  function handleLimit(e){
    setLimit(e.target.value)
    loadPieces('', pieces.page, limit)
  }

  const [ sort, setSort ] = useState('-createdAt')
  function handleSort(e){
    setSort(e.target.value)
  }

  const [ searchPiece, setSearchPiece, ] = useState('')
  function handleSearchChange(e){
    setSearchPiece(e.target.value)
  }

  async function handleSearch(){
    await loadPieces(searchPiece, sort, limit)
  }

  function handleEnter(e){
    if(e.key === 'Enter'){
      handleSearch()
    }
  }

  useEffect(()=>{
    loadPieces('', sort, limit)
  }, [sort])


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

  async function cloneReport(){
    values.cloneReport = true

    handleSubmit()
  }

  async function deleteReport(){
    try {
      ipc.send(SEND_DELETE_REPORT, state)

      ipc.on(GET_DELETE_REPORT, (event, arg) =>{
        const report = JSON.parse(arg.data)

        notify.show(report, 'success', 2000, )
      })
    }catch(error){

    }
  }

  useEffect( ()=>{
    loadPieces()
  },[])

  useEffect( ()=>{
    loadReport()
  },[])


  useEffect(()=>{
    calcTotalTime()
  }, [isAddPiece, isPieceRemoved])


  useEffect(()=>{
    loadPieces('', sort, limit)
  }, [limit])

  useEffect(()=>{
    loadPieces('', sort, limit)
  }, [sort])

  useEffect(()=>{
    calcProductionTime()
  }, [values.workers])


  let pages = []
  for (let i = 1; i <= Math.ceil(pieces.length/limit) ; i++){

    if( page === i){
      pages.push(
        <li key={i} className="page-item disabled">
          <p className="page-link" >{i}</p>
        </li>
      )
    }else{
      pages.push(
        <li key={i} className="page-item">
          <p onClick={()=> setPage(i)} className="page-link" >{i}</p>
        </li>
      )
    }
  }

  return (
    <Wrapper>
      <Notifications/>
      <Container>
        <Box title>
          <Title>
            Editar Relatório
          </Title>
        </Box>
        { isReportDataLoading
          ? <div data-role="progress" data-type="line"></div>
          : <Box>
            <Row>
              <Title>
                Relatório - {reportData.name}
              </Title>
              <div
                style={{marginLeft: 'auto'}}
              >
                <button
                  className="button primary drop-shadow mr-6"
                  type='button'
                  onClick={cloneReport}
                >
                  <span className="mif-stack3"></span> Clonar Relatório
                </button>
                <button
                  className="button alert drop-shadow"
                  type='button'
                  onClick={handleDelete}
                >
                  <span className="mif-bin"></span> Remover Relatório
                </button>
              </div>
            </Row>
          </Box>
        }

        { isPiecesLoading
          ? <div data-role="progress" data-type="line"></div>
          : <Content>
              <Box>
                <ReportList>
                  <p>Pesquisar Peça</p>
                  <input
                    type="text"
                    name='search'
                    placeholder='Digite o nome da peça que deseja pesquisar'
                    data-role="input"
                    data-search-button="true"
                    onChange={handleSearchChange}
                    onKeyPress={handleEnter}
                  />

                  <div
                    style={{
                      marginTop: '10px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gridColumnGap: '20px'
                    }}
                  >
                    <div>
                      <p>Quantidade de  Peças por Página</p>
                      <select
                        name="limit"
                        placeholder='Selecione a quantidade de peças a serem monstradas por página'
                        className='mb-6'
                        onChange={handleLimit}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                        <option value={25}>25</option>
                      </select>
                    </div>

                    <div>
                      <p>Ordenar Peças por:</p>
                      <select
                        name="sort"
                        placeholder='Selecione a opção de ordenação'
                        className='mb-6'
                        onChange={handleSort}
                      >
                        <option value={'-createdAt'}>Data (Mais recente)</option>
                        <option value={'createdAt'}>Data (Mais antiga)</option>
                        <option value={'name'}>Nome em ordem crescente</option>
                        <option value={'-name'}>Nome em ordem decrescente</option>
                      </select>
                    </div>

                  </div>
                  <ReportHeader>
                    <ReportTitle>
                      Peça
                    </ReportTitle>
                    <ReportTitle>
                      Quantidade
                    </ReportTitle>
                    <ReportTitle>
                      Ação
                    </ReportTitle>
                  </ReportHeader>
                  { pieces
                    .slice((page * limit) -  limit, page * limit)
                    .filter(({name})=>{
                      return(
                        name.toLowerCase().trim()
                          .indexOf(searchPiece.toLowerCase().trim()) !== -1
                      )
                    })
                    .map((piece, index)=>(
                      <ReportRow key={piece._id}>
                        <ReportItem column>
                          <strong
                            className='mr-6'
                          >
                            <Highlight search={searchPiece}>
                              {piece.name}
                            </Highlight>
                          </strong>
                          <img width={100} height={100}
                               src={IMAGE_URL+piece.image} alt=""
                          />
                        </ReportItem>

                        <ReportItem>
                          <Field
                            type='number'
                            name={`piecesAmount[${index}]`}
                            value={values.piecesAmount[index]}
                            placeholder='Digite a quantidade de Peças'
                            data-role="input"
                            data-size='300px'
                          />
                        </ReportItem>
                        <ReportItem>
                          <button
                            className="button primary outline drop-shadow"
                            onClick={() => addReportPiece(piece ,values.piecesAmount[index]) }
                          >
                            <span className="mif-add"></span> Adicionar
                          </button>
                        </ReportItem>
                      </ReportRow>
                    ))}
                  <ul className="pagination flex-justify-center">
                    {
                      page > 1
                        ? <li className="page-item service">
                          <p onClick={()=>setPage(page - 1)} className="page-link" >Anterior</p>
                        </li>
                        : <li className="page-item service disabled">
                          <p  className="page-link" >Anterior</p>
                        </li>
                    }
                    {pages}

                    {
                      page < Math.ceil(pieces.length/limit)
                        ? <li className="page-item service">
                          <p onClick={()=> setPage(page + 1)} className="page-link" >Próximo</p>
                        </li>
                        : <li className="page-item service disabled">
                          <p className="page-link" >Próximo</p>
                        </li>
                    }

                  </ul>
                </ReportList>
                {report.length > 0
                  ? <div>
                    <ReportTableHeader center className='mt-6'>
                      <Title>
                        Relatório
                      </Title>
                    </ReportTableHeader>

                    {report.map(({piece, amount, totalTime}, index) => (
                      <Fragment key={index}>
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
                          <button className='button alert drop-shadow'
                                  onClick={() => removeReportPiece(index)}
                          >
                            <span className="mif-bin"></span> Remover
                          </button>
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
                            {totalTime.hours > 0 && totalTime.hours} {totalTime.hours > 0 ? (totalTime.hours > 1 ? ' horas, ' : ' hora, ') : ''}
                            {totalTime.minutes} {totalTime.minutes > 1 ? ' minutos e ' : ' minito e '}
                            {totalTime.seconds} {totalTime.seconds > 1 ? ' segundos.' : ' segudo.'}

                          </div>
                        </ReportTableRow>
                      </Fragment>
                    ))}

                    <ReportTableRow result>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div>
                        <strong>Tempo Total: </strong>
                        {piecesTotalTime.hours > 0 && piecesTotalTime.hours}
                        {piecesTotalTime.hours < 1 ? '' : piecesTotalTime.hours > 1 ? ' horas, ' : ' hora, '}
                        {piecesTotalTime.minutes} {piecesTotalTime.minutes > 1 ? ' minutos e ' : ' minuto e '}
                        {piecesTotalTime.seconds} {piecesTotalTime.seconds > 1 ? ' segundos.' : ' segundo.'}
                      </div>
                      <div>
                        <strong>Tempo Total: </strong>
                        {piecesAmountTime.hours > 0 && piecesAmountTime.hours}
                        {piecesAmountTime.hours < 1 ? '' : piecesAmountTime.hours > 1 ? ' horas, ' : ' hora, '}
                        {piecesAmountTime.minutes} {piecesAmountTime.minutes > 1 ? ' minutos e ' : ' minuto e '}
                        {piecesAmountTime.seconds} {piecesAmountTime.seconds > 1 ? ' segundos.' : ' segundo.'}
                      </div>
                    </ReportTableRow>

                    <p>Quantidade de trabalhadores</p>
                    <Field
                      type='number'
                      name='workers'
                      value={values.workers}
                      placeholder='Digite a quantidade de pessoas disponíveis para produzir estas peças'
                      data-role="input"
                      className='mb-6'
                    />
                    <ErrorMessage name='workers'>
                      {error => <div style={{color: 'red'}}>{error}</div>}
                    </ErrorMessage>

                    <ReportTableRow result>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div>
                        <strong>Tempo Total de Produção: </strong>

                        {productionTime.hours}
                        {productionTime.hours === 1 ? ' hora, ' : ' horas, '}

                        {productionTime.minutes}
                        {productionTime.minutes > 1 ? ' minutos e ' : ' minutos e '}

                        {productionTime.seconds}
                        {productionTime.seconds > 1 ? ' segundos.' : ' segundos.'}


                      </div>
                    </ReportTableRow>

                    <Row>
                      <button
                        className="button success drop-shadow btn-align"
                        type='submit'
                        onClick={handleSubmit}
                      >
                        <span className="mif-floppy-disk"></span> Salvar Relatório
                      </button>
                    </Row>
                  </div>
                  : null
                }

              </Box>
            </Content>
        }

      </Container>
    </Wrapper>
  )
}

export default withFormik({
  mapPropsToValues(){
    return{
      pieces:[],
      piecesAmount: [],
      report:{
        pieces:[ ]
      },
      piecesTime: [],
      amountPiecesTime: [],
      workers: 0,
      cloneReport: false
    }
  },

  validationSchema: Yup.object().shape({
    workers: Yup
      .number()
      .min(1, 'Insira ao menos um trabalhador.')
      .required('Favor, insira a quantidade de trabalhadores.')
  }),

  async handleSubmit(values, {props: {history}}){
    const electron = window.require('electron')
    const ipc = electron.ipcRenderer

    try {
      const { report: {pieces},  workers, cloneReport, id } = values

      const piecesData = pieces.map(({piece: {_id}, amount})=>{
        return{
          piece: _id,
          amount,
        }
      })



      if(cloneReport){
        const data = {
          pieces: piecesData,
          workers
        }
        ipc.send(SEND_CREATE_REPORT, data )

        ipc.on(GET_CREATE_REPORT, (event, arg) =>{
          const report = JSON.parse(arg.data)

          history.push({pathname: '/relatorio', state: report.data._id})

          notify.show(report.message, 'success', 2000)
        })
      }else{
        const data = {
          pieces: piecesData,
          workers
        }
        ipc.send(SEND_UPDATE_REPORT, {id, data} )

        ipc.on(GET_UPDATE_REPORT, (event, arg) =>{
          const report = JSON.parse(arg.result)

          history.push({pathname: '/relatorio', state: report.data._id})

          notify.show(report.message, 'success', 2000)
        })
      }

    }catch(error){
      notify.show(error.response.data.message, 'error', 2000)

    }

  }
}) (EditReport)
