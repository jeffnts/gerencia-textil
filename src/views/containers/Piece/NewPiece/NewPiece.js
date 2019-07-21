import React, { Fragment, useState,  createRef, useEffect } from 'react'
import { withFormik, Form, Field, FieldArray, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import Notifications, {notify} from 'react-notify-toast'
import path from 'path'

import {
  SEND_CREATE_PIECE,
  GET_CREATE_PIECE } from '../../../../config/utils/constants'

import { Wrapper,  Step } from './NewPieceStyle'
import { Title, Container, Box, Row, FormItem } from '../../../components/UI/Commons'


const NewPiece = ({values, handleChange, handleSubmit, touched, errors}) => {

  const [ image, setImage ] = useState()
  const [ imageLoading, setImageLoading ] = useState(true)
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
      setImageLoading(false)
    }
  }



  const [ machine, setMachine ] = useState([])
  const [ description, setDescription ] = useState([])
  const [ minutes, setMinutes ] = useState([])
  const [ seconds, setSeconds ] = useState([])

  let machineRef = {}
  let descriptionRef = {}
  let minutesRef = {}
  let secondsRef = {}

  useEffect(()=>{
    for( let i = 0; i < values.steps.length; i++){
      machineRef[i] = createRef()
      descriptionRef[i] = createRef()
      minutesRef[i] = createRef()
      secondsRef[i] = createRef()

      setMachine(machineRef)
      setDescription(descriptionRef)
      setMinutes(minutesRef)
      setSeconds(secondsRef)
    }

  }, [values.steps])


  function handleEnter(e, next){
    if(e.key === 'Enter'){
      if(next === undefined){ return }
      next.current.focus()
    }
  }



  return (
    <Wrapper>
      <Notifications/>
      <Container>
        <Form>
          <Box title>
            <Title>
              Nova Peça
            </Title>
          </Box>
          <Box>
            <Title>
              Descrição:
            </Title>
            <Row>
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
                  className='error'
                  data-size='500px'
                  onKeyPress={e => handleEnter(e, machine[0])}
                />
                <ErrorMessage name='name'>
                  {error => <div className='error'>{error}</div>}
                </ErrorMessage>
              </FormItem>

              <FormItem>
                <p>Imagem da Peça</p>
                <input
                  name='image'
                  type='file'
                  onChange={getImage}
                  data-button-title='Insira a imagem'
                  data-role="file"
                  data-size='400px'
                />
              </FormItem>
              { imageLoading
                ? null
                : <img width={100} height={100} src={image} alt=""/>
              }
            </Row>

          </Box>

          <Box>
            <Title>
              Etapas:
            </Title>

            <FieldArray
              name="steps"
              render={arrayHelpers => (
                <Fragment>
                  {values.steps && values.steps.length > 0 && values.steps.map((step, index) => (
                    <Row key={index}>
                      <FormItem className='mt-6'>
                        <Step>
                          Etapa {index+1}
                        </Step>
                      </FormItem>

                      <FormItem
                        className='mt-6'
                      >
                        <p>Máquina</p>
                        <input
                          type='text'
                          ref={machine[index]}
                          placeholder='Digite o nome da máquina'
                          name={`steps.[${index}].machine`}
                          data-role="input"
                          data-size='400px'
                          className='error'
                          onChange={handleChange}
                          onKeyPress={e => handleEnter(e,  description[index])}
                        />
                        <ErrorMessage name={`steps[${index}].machine`}>
                          {error => <div className='error'>{error}</div>}
                        </ErrorMessage>
                      </FormItem>

                      <FormItem className='mt-6'>
                        <p>Descrição</p>
                        <input
                          type='text'
                          ref={description[index]}
                          placeholder='Digite a descrição da etapa'
                          name={`steps.[${index}].description`}
                          data-role="input"
                          data-size='400px'
                          onChange={handleChange}
                          onKeyPress={e => handleEnter(e,  minutes[index])}
                        />
                        <ErrorMessage name={`steps[${index}].description`}>
                          {error => <div className='error'>{error}</div>}
                        </ErrorMessage>
                      </FormItem>

                      <FormItem style={{marginTop: '0px'}}>
                        <p>Tempo  </p>
                        <Row>
                          <div className='mr-2'>
                            <p>Minutos</p>
                            <input
                              type='number'
                              ref={minutes[index]}
                              maxLength='2'
                              data-role='input'
                              data-size='100px'
                              name={`steps.[${index}].minutes`}
                              onChange={handleChange}
                              onKeyPress={e => handleEnter(e,  seconds[index])}
                            />
                          </div>
                            <p> : </p>
                          <div className='ml-2'>
                            <p>Segundos</p>
                            <input
                              type='number'
                              ref={seconds[index]}
                              maxLength='2'
                              data-role='input'
                              data-size='100px'
                              name={`steps.[${index}].seconds`}
                              onChange={handleChange}
                              onKeyPress={ e => handleEnter(e,  machine[index + 1])}
                            />
                          </div>
                        </Row>
                          <ErrorMessage name={`steps[${index}].minutes`}>
                            {error => <div className='error'>{error}</div>}
                          </ErrorMessage>
                          <ErrorMessage name={`steps[${index}].seconds`}>
                            {error => <div className='error'>{error}</div>}
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
                          onClick={() => { arrayHelpers.insert(index + 1, { step: 0, machine: '', description:'' })}}
                          data-role="hint"
                          data-hint-text="Clique para Adicionar uma Etapa"
                        >
                          <span className="mif-add"></span>
                        </button>
                      </FormItem>

                    </Row>
                  ))}

                </Fragment>
              )}
            />
            <Row>
              <button
                className="button success drop-shadow btn-align "
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

  )
}

export default withFormik({
  mapPropsToValues(){
    return{
      name:'',
      image: {
        name: 'sem-imagem.jpg',
        path: path.join(__dirname, '..', '..', '..', '..', 'public', 'images', 'sem-imagem.jpg')
      },
      steps: [
        {
          step:1,
          machine: '',
          description: ''
        },

      ]
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
      values.steps.map((step, index)=>{
        step.step = index + 1
      })

      values.steps.push({step: values.steps.length + 1, machine: 'Intervalo', description: 'Intervalo de Produção', minutes: Math.floor((30* values.steps.length)/60), seconds: Math.floor((30* values.steps.length)%60)})


      const electron = window.require('electron')
      const ipc = electron.ipcRenderer

      ipc.send(SEND_CREATE_PIECE, values)

      ipc.on(GET_CREATE_PIECE, (event, arg) =>{
        const piece = JSON.parse(arg.data)

        history.push({pathname: '/peca', state: piece.data._id})

        notify.show(piece.message, 'success', 2000, )
      })

    }catch (error) {
      console.log(error.response)
      notify.show(error.response.data.message, 'error', 2000)  }

    }
})(NewPiece)

