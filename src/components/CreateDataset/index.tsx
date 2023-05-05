import { useRef, useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import {
  Modal,
  Form,
  Input,
  FormInstance,
  Message
} from '@arco-design/web-react'

import { useStore } from '@libs/store'

interface Props {
  onClose: () => void
}

const CreateDataset = observer((props: Props) => {
  const store = useStore()
  const form = useRef<FormInstance>(null)
  const [visible, setVisible] = useState(false)

  const onSubmit = async () => {
    const { name } = await form.current?.validate()
    try {
      await store.createDataset(name)
      props.onClose()
      Message.success('Dataset Created')
    } catch (error: any) {
      Message.error(error.message || 'Create Failed')
    }
  }

  useEffect(() => {
    setVisible(true)
  }, [])

  return (
    <Modal
      title="Create Dataset"
      simple
      onConfirm={onSubmit}
      unmountOnExit
      maskClosable={false}
      visible={visible}
      onCancel={() => setVisible(false)}
      afterClose={props.onClose}
    >
      <Form layout="vertical" ref={form} size="large">
        <Form.Item label="Namespace">
          <Input disabled value={store.currentSpace} />
        </Form.Item>
        <Form.Item
          label="Dataset Name"
          field="name"
          rules={[
            {
              required: true
            },
            {
              validator(value, cb) {
                const msg = '1-16 alphanumeric characters, no spaces'
                if (!/^[a-zA-Z0-9]{1,16}$/.test(value)) cb(msg)
                else cb()
              }
            }
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  )
})

export default CreateDataset
