import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Notifications, {notify} from 'react-notify-toast'
import { confirmAlert } from 'react-confirm-alert'
import path from 'path'


import {
  IMAGE_URL,
  SEND_DELETE_PIECE,
  GET_DELETE_PIECE,
  SEND_ONE_PIECE,
  GET_ONE_PIECE } from '../../../../config/utils/constants'


import { Image } from './ShowPieceStyle'

import { Container, Box, Row, Title } from '../../../components/UI/Commons'




const ShowPiece = ({location: {state}, history}) => {
  const [ piece, setPiece ] = useState()
  const [ isPieceLoading, setIsPieceLoading ] = useState(true)

  const electron = window.require('electron')
  const ipc = electron.ipcRenderer

  function fetchData(){
    try {
      ipc.send(SEND_ONE_PIECE, state)

      ipc.on(GET_ONE_PIECE, (event, arg) =>{
        const piece = JSON.parse(arg.data)

        setPiece(piece)
        setIsPieceLoading(false)
      })

    }catch (error) {

    }
  }

  function handleDelete() {
    confirmAlert({
      title: 'Remover Peça',
      message: 'Tem certeza que deseja remover esta peça?',
      buttons: [
        {
          label: 'Sim',
          onClick:  () => {
            deletePiece()
          }
        },
        {
          label: 'Não',
          onClick: () => {}
        }
      ]
    })
  }

  function deletePiece(){
    try {
      ipc.send(SEND_DELETE_PIECE, state)

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
        }else{
          notify.show(result, 'success', 2000)
          history.push('/lista-pecas')
        }
      })

    }catch(error){

    }
  }

  useEffect(()=>{
    fetchData()
  }, [])

  return (
    <div>
      <Notifications/>
      <Container>
        <Box title>
          <Title>
            Peça
          </Title>
        </Box>

        <Box>
          {isPieceLoading
            ? <div data-role="progress" data-type="line"></div>
            : <Row>
              <Title className='mr-2'>
                Referência:
              </Title>
              {piece.name}
              <Image
                src={path.join(IMAGE_URL, piece.image)}
                height={100}
                width={100}
              />
            </Row>
          }

        </Box>

        <Box>
          <Title>
            Etapas:
          </Title>
          { isPieceLoading
            ? <div data-role="progress" data-type="line"></div>
            : <table
                className="table"
                data-role="table"
                data-show-pagination="false"
                data-show-rows-steps="false"
                data-show-table-info="false"
                data-show-search="false"
                data-rows={-1}
            >
                <thead>
                  <tr>
                    <th>
                      Etapa
                    </th>
                    <th>
                      Máquina
                    </th>
                    <th>
                      Descrição
                    </th>
                    <th>
                      Tempo
                    </th>
                  </tr>
                </thead>
                <tbody>
                  { piece.steps.map((step, index)=>(
                    <tr key={index}>
                      <td>
                        <strong>
                          {step.step}
                        </strong>
                      </td>
                      <td>
                        {step.machine}
                      </td>
                      <td>
                        {step.description}
                      </td>
                      <td>
                        {step.minutes} minutos e {step.seconds} segundos
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>
                      <strong>
                        Tempo Total de Produção: {piece.totalTime.hours}{piece.totalTime.hours > 1? ' horas, ': ' hora, '}
                                                 {piece.totalTime.minutes} {piece.totalTime.minutes > 1? ' minutos ': ' minuto '} e {' '}
                                                 {piece.totalTime.seconds} {piece.totalTime.seconds > 1? ' segundos ': ' segundo'}.
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </table>
          }
        </Box>
        <Box>
          <Row>
            <div></div>
            <div
              style={{marginLeft: 'auto'}}
            >
              <Link to={{pathname:'/editar-peca', state}}>
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
      </Container>
    </div>

  )
}

export default ShowPiece
