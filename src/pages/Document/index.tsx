import classNames from 'classnames'
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useImperativeHandle,
  forwardRef
} from 'react'
import { observer } from 'mobx-react'
import {
  Breadcrumb,
  Input,
  Button,
  Empty,
  Table,
  TableColumnProps,
  Space,
  Modal,
  Message
} from '@arco-design/web-react'
import { IconEdit, IconDelete, IconEye } from '@arco-design/web-react/icon'
import { useWeb3React } from '@web3-react/core'

import styles from './style.module.scss'
import { ReactComponent as IconDatabase } from '@assets/imgs/database.svg'
import { ReactComponent as IconTable } from '@assets/imgs/table.svg'
import { ReactComponent as IconFolder } from '@assets/imgs/folder.svg'
import useDocs from '@hooks/useDocs'
import { useStore } from '@libs/store'
import * as modals from '@libs/modals'

interface Props {
  index: number
  visible: boolean
}

const DefaultCmd = 'find({}).skip(0).limit(10)'

const Document = observer(
  forwardRef((props: Props, ref) => {
    const store = useStore()
    const { account } = useWeb3React()

    const tab = useMemo(() => {
      return store.tabs[props.index]
    }, [store.tabs, props.index])

    const { docs, loading, list } = useDocs(
      tab.namespace,
      tab.dataset,
      tab.collection.collection
    )
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(20)
    const [cmd, setCmd] = useState(DefaultCmd)

    const items = useMemo(() => {
      const start = (page - 1) * limit
      return docs.slice(start, start + limit)
    }, [docs, page, limit])

    const refresh = useCallback(() => {
      setCmd(DefaultCmd)
      list(DefaultCmd)
    }, [list])

    useImperativeHandle(ref, () => {
      return {
        refresh
      }
    })

    const deleteOne = useCallback(
      (doc: any) => {
        Modal.confirm({
          title: 'Delete Document',
          simple: true,
          content: `Delete document with id: ${doc._id} ?`,
          onOk: async () => {
            await store.deleteDocument(
              tab.namespace,
              tab.dataset,
              tab.collection.collection,
              doc._id
            )
            Message.success('Document Deleted')
            tab.ref?.refresh()
          }
        })
      },
      [store, tab]
    )

    const share = () => {
      // const scan = `https://testnet.scan.glacier.io/dataset?namespace=${tab.namespace}&dataset=${tab.dataset}`
      // const text = `Check out this decentralized database on glacier ${scan} via @Glacier_Labs`
      const text = `💰Hey, I earned 10 $GLC

🧊Just write on Glacier Testnet

@Glacier_Labs is building a modular, dynamic and scalable NoSQL #database for large-scale Dapps.

Join the #Referral Program via my link
👉https://www.glacier.io/referral/?${account}

#Web3 #Giveaways #Airdrop`

      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}`
      window.open(url)
    }

    const columns = useMemo(() => {
      const cols: TableColumnProps<any>[] = [
        {
          title: '_id',
          dataIndex: '_id',
          width: 100
        }
      ]
      const keysSet = new Set<string>()
      for (const item of items) {
        const keys = Object.keys(item)
        for (const key of keys) {
          if (key !== '_id') keysSet.add(key)
        }
      }
      for (const key of Array.from(keysSet).sort()) {
        cols.push({
          title: key,
          dataIndex: key,
          width: 200,
          render: value => {
            let result = value
            if (typeof result === 'object' || typeof result === 'boolean') {
              result = JSON.stringify(result)
            }
            return <span className={styles.col}>{result}</span>
          }
        })
      }
      cols.push({
        title: '',
        dataIndex: 'opt',
        width: 120,
        fixed: 'right',
        render: (value, record) => {
          return (
            <Space>
              <Button
                icon={<IconEye />}
                size="mini"
                type="primary"
                status="success"
                onClick={() => {
                  modals.viewDocument(JSON.stringify(record, null, 2))
                }}
              />
              <Button
                icon={<IconEdit />}
                size="mini"
                type="primary"
                status="success"
                onClick={() => {
                  modals.editDocument(
                    tab.namespace,
                    tab.dataset,
                    tab.collection,
                    record._id,
                    JSON.stringify(record, null, 2)
                  )
                }}
              />
              <Button
                icon={<IconDelete />}
                size="mini"
                type="primary"
                status="danger"
                onClick={() => {
                  deleteOne(record)
                }}
              />
            </Space>
          )
        }
      })
      return cols
    }, [items, tab, deleteOne])

    useEffect(() => {
      list(DefaultCmd)
    }, [list])

    return (
      <div
        className={classNames(styles.wrap, {
          [styles.visible]: props.visible
        })}
      >
        <div className={styles.head}>
          <div className={styles.nav}>
            <Breadcrumb>
              <Breadcrumb.Item className={styles.breadcrumb}>
                <IconFolder className={styles.folder} />
                <span>{tab.namespace}</span>
              </Breadcrumb.Item>
              <Breadcrumb.Item className={styles.breadcrumb}>
                <IconDatabase className={styles.storage} />
                <span>{tab.dataset}</span>
              </Breadcrumb.Item>
              <Breadcrumb.Item className={styles.breadcrumb}>
                <IconTable className={styles.file} />
                <span>{tab.collection.collection}</span>
              </Breadcrumb.Item>
            </Breadcrumb>
            <Space direction="vertical" align="end">
              <Button
                type="primary"
                status="success"
                onClick={() => {
                  modals.editDocument(
                    tab.namespace,
                    tab.dataset,
                    tab.collection
                  )
                }}
              >
                Insert Document
              </Button>
            </Space>
          </div>
          <div className={styles.toolbar}>
            <Input
              addBefore="Filter"
              prefix={`db.collection("${tab.collection.collection}").`}
              value={cmd}
              onChange={value => setCmd(value)}
            />
            <Button
              type="primary"
              status="success"
              loading={loading}
              onClick={() => list(cmd)}
            >
              Apply
            </Button>
            <Button type="outline" status="success" onClick={refresh}>
              Reset
            </Button>
          </div>
        </div>
        <div className={styles.main}>
          {docs.length === 0 ? (
            <Empty />
          ) : (
            <div>
              <Table
                data={items}
                columns={columns}
                rowKey="_id"
                scroll={{ x: true }}
                pagination={{
                  showTotal: true,
                  pageSize: limit,
                  onChange(pageNumber, pageSize) {
                    setLimit(pageSize)
                    setPage(pageNumber)
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    )
  })
)

export default Document
