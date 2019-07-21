import React, { useState, useEffect } from 'react'
import { withFormik, Form, Field, FieldArray, ErrorMessage  } from 'formik'
import Notifications, {notify} from 'react-notify-toast'
import * as Yup from 'yup'
import { confirmAlert } from 'react-confirm-alert'
import path from 'path'

import {
  IMAGE_URL,
  SEND_ONE_PIECE,
  GET_ONE_PIECE,
  SEND_DELETE_PIECE,
  GET_DELETE_PIECE,
  SEND_CREATE_PIECE,
  GET_CREATE_PIECE,
  SEND_UPDATE_PIECE,
  GET_UPDATE_PIECE } from '../../../../config/utils/constants'

import { Title, Container, Box, Row, FormItem } from '../../../components/UI/Commons'
import { Wrapper } from './EditPieceStyle'
import {Step} from '../NewPiece/NewPieceStyle';


const EditPiece = ({history, values, handleSubmit, touched, errors}) => {
  const [ loadingPiece, setLoadingPiece ] = useState(true)

  const electron = window.require('electron')
  const ipc = electron.ipcRenderer

  function loadPiece(){
    try {
      ipc.send(SEND_ONE_PIECE, history.location.state)

      ipc.on(GET_ONE_PIECE, (event, arg) =>{
        const piece = JSON.parse(arg.data)

        values.name = piece.name
        values.image = {
          name: piece.image,
          path: path.join(__dirname, '..', '..', '..', '..', 'public', 'images', piece.image)
        }
        values.steps = piece.steps

        values.steps.pop()


        values.previousImage = values.image.name
        values.id = piece._id
        setLoadingPiece(false)
      })
    }catch (error) {

    }
  }

  const [ image, setImage ] = useState('')
  function getImage (e){
    const image = e.target.files[0]

    values.image = {
      name: e.target.files[0].name,
      path: e.target.files[0].path
    }

    const reader = new FileReader()
    reader.readAsDataURL(image)
    reader.onload = e =>{
      setImage(e.target.result)
      values.imageChange = true
    }
  }

  function handleDelete() {
    confirmAlert({
      title: 'Remover Peça',
      message: 'Tem certeza que deseja remover esta peça?',
      buttons: [
        {
          label: 'Sim',
          onClick: deletePiece
        },
        {
          label: 'Não',
          onClick: () => {}
        }
      ]
    })
  }

  async function clonePiece(){
    values.clonePiece = true

    handleSubmit({valueChanged: 1})
  }

  async function deletePiece(){
    try {
      ipc.send(SEND_DELETE_PIECE, history.location.state)

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
    loadPiece()
  }, [])


  return (
    <div>
      <Notifications/>
      <Wrapper>
        <Container>
          <Form>
            <Box title>
              <Title>
                Editar Peça
              </Title>
            </Box>

            <Box>
              <Title>
                Descrição:
              </Title>
              {loadingPiece
                ? <div data-role="progress" data-type="line"></div>
                : <Row>
                  <FormItem
                    error={touched.name && errors.name && true}
                  >
                    <p>Referência</p>
                    <Field
                      type='text'
                      name='name'
                      value={values.name}
                      placeholder='Digite a referência da peça'
                      data-role="input"
                      data-size='500px'
                    />
                    <ErrorMessage name='name'>
                      {error => <div style={{color: 'red'}}>{error}</div>}
                    </ErrorMessage>
                  </FormItem>

                  <FormItem>
                    <p>Imagem da Peça</p>
                    <input
                      name='values.image'
                      type='file'
                      onChange={getImage}
                      data-button-title='Insira a imagem'
                      data-role="file"
                      data-size='400px'
                    />
                  </FormItem>
                  {
                    loadingPiece
                    ? null
                    : <img height={100} width={100}
                           src={image === ''? path.join(IMAGE_URL, values.image.name): image} alt=""/>
                  }

                  <div className="btn-align">
                    <button
                      className="button primary drop-shadow mr-6"
                      type='button'
                      onClick={clonePiece}
                    >
                      <span className="mif-stack3"></span> Clonar Peça
                    </button>
                    <button
                      className="button alert drop-shadow"
                      type='button'
                      onClick={handleDelete}
                    >
                      <span className="mif-bin"></span> Remover Peça
                    </button>
                  </div>
                </Row>
              }


            </Box>

            <Box>
              <Title>
                Etapas:
              </Title>
              {
                loadingPiece
                ?  <div data-role="progress" data-type="line"></div>
                :  <FieldArray
                    name="steps"
                    render={arrayHelpers => (
                      <div>
                        {values.steps.map((step, index) => (
                          <Row key={index}>
                            <FormItem className='mt-6'>
                              <Step>
                                Etapa {index+1}
                              </Step>
                            </FormItem>

                            <FormItem className='mt-6'>
                              <p>Máquina</p>
                              <Field
                                type='text'
                                placeholder='Digite o nome da máquina'
                                name={`steps.[${index}].machine`}
                                data-role="input"
                                data-size='400px'
                              />
                              <ErrorMessage name={`steps[${index}].machine`}>
                                {error => <div style={{color: 'red'}}>{error}</div>}
                              </ErrorMessage>
                            </FormItem>

                            <FormItem className='mt-6'>
                              <p>Descrição</p>
                              <Field
                                type='text'
                                placeholder='Digite a descrição da etapa'
                                name={`steps.[${index}].description`}
                                data-role="input"
                                data-size='400px'
                              />
                              <ErrorMessage name={`steps[${index}].description`}>
                                {error => <div style={{color: 'red'}}>{error}</div>}
                              </ErrorMessage>
                            </FormItem>

                            <FormItem style={{marginTop: '0px'}}>
                              <p>Tempo  </p>
                              <Row>
                                <div className='mr-2'>
                                  <p>Minutos</p>
                                  <Field
                                    type='number'
                                    data-role='input'
                                    data-size='100px'
                                    name={`steps.[${index}].minutes`}
                                  />
                                </div>
                                <p> : </p>
                                <div className='ml-2'>
                                  <p>Segundos</p>
                                  <Field
                                    type='number'
                                    data-role='input'
                                    data-size='100px'
                                    name={`steps.[${index}].seconds`}
                                  />
                                </div>
                              </Row>
                              <ErrorMessage name={`steps[${index}].minutes`}>
                                {error => <div style={{color:'red'}}>{error}</div>}
                              </ErrorMessage>
                              <ErrorMessage name={`steps[${index}].seconds`}>
                                {error => <div style={{color:'red'}}>{error}</div>}
                              </ErrorMessage>
                            </FormItem>

                            {values.steps.length > 1 && (
                              <FormItem className='mt-6'>
                                <button
                                  className="button primary cycle alert mt-5"
                                  type='button'
                                  onClick={() => arrayHelpers.remove(index)}
                                  data-role="hint"
                                  data-hint-text="Clique para Remover esta Etapa"
                                >
                                  <span className="mif-bin"></span>
                                </button>
                              </FormItem>
                            )}

                            <FormItem className='mt-6'>
                              <button
                                className="button primary cycle success mt-5"
                                type='button'
                                onClick={() => {arrayHelpers.insert(index + 1, { step: 0, machine: '', description:''})}}
                                data-role="hint"
                                data-hint-text="Clique para Adicionar uma Etapa"
                              >
                                <span className="mif-add"></span>
                              </button>
                            </FormItem>
                          </Row>
                        ))}

                      </div>
                    )}
                  />
              }


              <Row>
                <button
                  className="button success drop-shadow btn-align"
                  type='submit'
                  onClick={handleSubmit}
                >
                  <span className="mif-floppy-disk"></span> Salvar Peça
                </button>
              </Row>
            </Box>
          </Form>
        </Container>
      </Wrapper>
    </div>
  )
}

export default withFormik({
  mapPropsToValues(){
    return{
      name:'',
      steps: [
        {
          step:1,
          machine: '',
          description: '',
          minutes:0,
          seconds: 1
        }
      ],
      id: '',
      imageChange: false,
      clonePiece: false
    }
  },


  validationSchema: Yup.object().shape({
    name: Yup
      .string()
      .required('Referência da peça é obrigatória!'),

    steps: Yup.array().of(
      Yup.object().shape({
        machine: Yup
          .string()
          .required('O nome da Máquina é Obrigatório!'),

        description: Yup
          .string()
          .required('A descrição da Etapa é obrigatória!'),

        minutes: Yup
          .number()
          .required('Insira ao menos um valor de 0 aos minutos.')
          .max(59, 'A quantidade de minutos não ser maior que 59.'),

        seconds: Yup
          .number('Digite apenas Números!')
          .required('A quantidade de Segundos é obrigatória!')
          .max(59, 'A quantidade de segundos não pode ser maior que 59.')
      })
    )

  }),

  async handleSubmit(values, {props: {history}}){
    try {
      const electron = window.require('electron')
      const ipc = electron.ipcRenderer

      const { id } = values

      values.steps.map((step, index)=>{
        step.step = index + 1
      })

      values.steps.push({step: values.steps.length + 1, machine: 'Intervalo', description: 'Intervalo de Produção', minutes: Math.floor((30* values.steps.length)/60), seconds: Math.floor((30* values.steps.length)%60)})

      const valuesData = {
        name: values.name,
        image: values.image,
        steps: values.steps
      }

      if (values.clonePiece){
        ipc.send(SEND_CREATE_PIECE, valuesData)

        ipc.on(GET_CREATE_PIECE, (event, arg) =>{
          const piece = JSON.parse(arg.data)

          history.push({pathname: '/peca', state: piece.data._id})

          notify.show(piece.message, 'success', 2000, )
        })
      }else{
        ipc.send(SEND_UPDATE_PIECE, {id, values})

        ipc.on(GET_UPDATE_PIECE, (event, arg) =>{
          const piece = JSON.parse(arg.data)

          history.push({pathname: '/peca', state: values.id})
          notify.show(piece.message, 'success', 2000, )
        })
      }

    }catch(error){
      console.log(error.response.data.message)
    }

  }
})(EditPiece)

