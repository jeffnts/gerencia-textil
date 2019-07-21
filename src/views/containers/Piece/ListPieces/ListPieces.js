import React, { useState, useContext, useEffect, useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import Highlight from 'react-highlighter'
import Notifications, {notify} from 'react-notify-toast'
import { confirmAlert } from 'react-confirm-alert'
import path from 'path'


import {
  SEND_ALL_PIECES,
  GET_ALL_PIECES,
  SEND_DELETE_PIECE,
  GET_DELETE_PIECE } from '../../../../config/utils/constants'

import { IMAGE_URL } from '../../../../config/utils/constants'


import { Container, Content,  Box, Title } from '../../../components/UI/Commons'
import { Pieces, Piece } from './ListPiecesStyle'

//import { LoadedPageContext } from '../../../store'

const ListPieces = () => {
  //const { isLoadedPage }  = useContext(LoadedPageContext)

  const electron = window.require('electron')
  const ipc = electron.ipcRenderer


  function fetchData(name = '', page=1 , limit = 5){
    ipc.send(SEND_ALL_PIECES, {name, page, limit})

    ipc.on(GET_ALL_PIECES, (event, arg) =>{
      const pieces = JSON.parse(arg.data)

      setPieces(pieces)
      setIsPiecesLoading(false)
    })
  }


  function handleDelete(index, id) {
    confirmAlert({
      title: 'Remover Peça',
      message: 'Tem certeza que deseja remover esta peça?',
      buttons: [
        {
          label: 'Sim',
          onClick: () => deletePiece(index, id)
        },
        {
          label: 'Não',
          onClick: () => {}
        }
      ]
    })
  }

  function deletePiece(index, id){
    try {
      ipc.send(SEND_DELETE_PIECE, id)

      ipc.on(GET_DELETE_PIECE, (event, arg) =>{

        const result = JSON.parse(arg.data)

        if(result.err){
          confirmAlert({
            title: 'Não é possível fazer esta operação!',
            message: result.data,
            buttons: [

              {
                label: 'Sair',
                onClick: () => {}
              }
            ]
          })
        }
        notify.show(result, 'success', 2000)

        const data = pieces.filter(({_id}) =>{
          return _id !== id
        })

        setPieces([...data])

      })

    }catch (error) {

    }
  }

  const [ pieces, setPieces ] = useState([])
  const [ searchPiece, setSearchPiece ] = useState('')
  const [ isPiecesLoading, setIsPiecesLoading ] = useState(true)

  const [ page, setPage ] = useState(1)


  const [ limit, setLimit ] = useState(5)
  function handleLimit(e){
    setLimit(e.target.value)
  }

  const [ sort, setSort ] = useState('-createdAt')
  function handleSort(e){
    setSort(e.target.value)
  }

  function handleChange(e) {
    setSearchPiece(e.target.value)
  }

  function handleSearch(){
    setPage(1)
    fetchData( searchPiece, sort, limit)
  }

  function handleEnter(e){
    if(e.key === 'Enter'){
      handleSearch()
    }
  }


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

  useEffect( ()=>{
    fetchData()
  },[])

  useEffect(()=>{
    fetchData('', sort, limit)
  }, [sort])


  return (
    <div>
      <Notifications/>
      <Container>
        <Box title>
          <Title>
            Lista de Peças
          </Title>
        </Box>

        <Box>
          <Content>
            <p>Pesquisar Peça</p>
            <input type="text"
                   placeholder='Digite a referência da peça que deseja procurar'
                   data-role="input"
                   data-search-button="true"
                   data-on-search-button-click={()=> console.log('clicou')}
                   data-search-button-click={()=> console.log('clicou')}
                   onChange={handleChange}
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

          </Content>

          <Pieces className='flex-justify-center'>
            {isPiecesLoading
              ? <div data-role="progress" data-type="line"></div>
              : pieces
                .slice((page * limit) -  limit, page * limit)
                .filter(({name})=>{
                  return(
                    name.toLowerCase().trim()
                      .indexOf(searchPiece.toLowerCase().trim()) !== -1
                  )
                })
                .map(({name, image, _id}, index)=>(
                  <Piece key={index}>
                    <div className="card">
                      <div className="card-header">
                        <h5>
                          <Highlight search={searchPiece}>
                            {name}
                          </Highlight>
                        </h5>
                      </div>
                      <div className="card-content p-2">
                        <img src={path.join(IMAGE_URL, image)} alt=""/>
                      </div>
                      <div className="card-footer">
                        <Link to={{pathname: '/peca', state: _id}}>
                          <button className='button primary drop-shadow'>
                            <span className="mif-enter"></span>  Acessar
                          </button>
                        </Link>
                        <Link to={{pathname: '/editar-peca', state: _id}}>
                          <button className='button secondary drop-shadow'>
                            <span className="mif-pencil"></span>  Editar
                          </button>
                        </Link>
                        <button className='button alert drop-shadow'
                                onClick={() => handleDelete(index, _id)}
                        >
                          <span className="mif-bin"></span> Remover
                        </button>

                      </div>
                    </div>
                  </Piece>
                ))
            }

          </Pieces>
          {
            isPiecesLoading
              ? <div data-role="progress" data-type="line"></div>
              : <ul className="pagination flex-justify-center">
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
                      <p onClick={()=>setPage(page + 1)} className="page-link" >Próximo</p>
                    </li>
                    : <li className="page-item service disabled">
                      <p className="page-link" >Próximo</p>
                    </li>
                  }

                </ul>
          }

        </Box>
      </Container>
    </div>
  )
}

export default ListPieces
