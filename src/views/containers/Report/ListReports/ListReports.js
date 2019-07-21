import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Highlight from 'react-highlighter'
import Notifications, {notify} from 'react-notify-toast'
import { confirmAlert } from 'react-confirm-alert'


import {
  SEND_ALL_REPORTS,
  GET_ALL_REPORTS,
  SEND_DELETE_REPORT,
  GET_DELETE_REPORT } from '../../../../config/utils/constants'


import { Container, Box, Title, Content } from '../../../components/UI/Commons'

import { Wrapper, ReportList, ReportHeader, ReportTitle, ReportRow, ReportItem } from './ListReportsStyle'

const ListReports = () => {
  const [ reports, setReports ] = useState([])
  const [ isReportsLoading, setIsReportsLoading ] = useState(true)

  const electron = window.require('electron')
  const ipc = electron.ipcRenderer

   function fetchData(name= '' , page = 1, limit = 5){
     ipc.send(SEND_ALL_REPORTS, {name, page, limit})

     ipc.on(GET_ALL_REPORTS, (event, arg) =>{
       const reports = JSON.parse(arg.data)

       setReports(reports)
       setIsReportsLoading(false)
     })
  }

  function handleDelete(index, id) {
    confirmAlert({
      title: 'Remover Relatório',
      message: 'Tem certeza que deseja remover este relatório?',
      buttons: [
        {
          label: 'Sim',
          onClick: async () => await deleteReport(index, id)
        },
        {
          label: 'Não',
          onClick: () => {}
        }
      ]
    })
  }

  function deleteReport(index, id){
    try {
      ipc.send(SEND_DELETE_REPORT, id)

        const result = reports.filter(({_id}) =>{
          return _id !== id
        })

        console.log(result)
        setReports([...result])

      ipc.on(GET_DELETE_REPORT, (event, arg) =>{
        const report = JSON.parse(arg.data)

        notify.show(report, 'success', 2000)
      })

    }catch (error) {
      confirmAlert({
        title: 'Erro ao tentar deletar este Relatório!',
        message: error.response.data.message,
        buttons: [

          {
            label: 'Sair',
            onClick: () => {}
          }
        ]
      })
    }
  }


  const [ searchReport, setSearchReport ] = useState('')
  function handleReportSearchChange(e){
    setSearchReport(e.target.value)
  }

  function handleReportSearch(){
    fetchData(searchReport, sort, limit)
  }

  function handleEnter(e){
    if(e.key === 'Enter'){
      handleReportSearch()
    }
  }

  const [ page, setPage ] = useState(1)

  const [ limit, setLimit ] = useState(5)
  function handleLimit(e){
    setLimit(e.target.value)
  }

  const [ sort, setSort ] = useState('-createdAt')
  function handleSort(e){
    setSort(e.target.value)
  }



  let pages = []
  for (let i = 1; i <= Math.ceil(reports.length/limit) ; i++){

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

  useEffect(()=>{
    fetchData()
  }, [])

  useEffect(()=>{
    fetchData('', sort, limit)
  }, [sort])


  return (
    <Wrapper>
      <Notifications/>
      <Container>
      <Box title>
        <Title>
          Lista de Relatórios
        </Title>
      </Box>
      <Box>
        <Content>
          {isReportsLoading
            ? <div data-role="progress" data-type="line"></div>
            : <ReportList>
              <p>Pesquisar Relatório</p>
              <input
                type="text"
                name='search'
                placeholder='Digite o nome do relatório que deseja pesquisar'
                data-role="input"
                data-search-button="true"
                onChange={handleReportSearchChange}
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
                  <p>Quantidade de  Relatórios por Página</p>
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
                  <p>Ordenar Relatórios por:</p>
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
                  Relatório
                </ReportTitle>
                <ReportTitle>
                </ReportTitle>
                <ReportTitle>
                  Ações
                </ReportTitle>
              </ReportHeader>
              { reports
                .slice((page * limit) -  limit, page * limit)
                .map(({_id, name}, index)=>(
                <ReportRow key={_id}>
                  <ReportItem>
                    <Title>
                      <Highlight search={searchReport}>
                        {name}
                      </Highlight>
                    </Title>
                  </ReportItem>
                  <ReportItem></ReportItem>
                  <ReportItem>
                    <div>
                      <Link to={{pathname: '/relatorio', state: _id}}>
                        <button className='button primary drop-shadow mr-2'>
                          <span className="mif-enter"></span>  Acessar
                        </button>
                      </Link>
                      <Link to={{pathname: '/editar-relatorio', state: _id}}>
                        <button className='button secondary drop-shadow mr-2'>
                          <span className="mif-pencil"></span>  Editar
                        </button>
                      </Link>
                      <button className='button alert drop-shadow'
                        onClick={() => handleDelete(index, _id)}
                      >
                        <span className="mif-bin"></span> Remover
                      </button>
                    </div>
                  </ReportItem>
                </ReportRow>
                ))
              }
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
                  page < Math.ceil(reports.length/limit)
                    ? <li className="page-item service">
                      <p onClick={()=> setPage(page + 1)} className="page-link" >Próximo</p>
                    </li>
                    : <li className="page-item service disabled">
                      <p className="page-link" >Próximo</p>
                    </li>
                }

              </ul>
            </ReportList>
          }

        </Content>
      </Box>
    </Container>
    </Wrapper>
  )
}

export default ListReports
