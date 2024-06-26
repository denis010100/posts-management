"use client"

import React, { useState, ChangeEvent, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Table, Input, Pagination, Modal, Button, message } from "antd"
import axios from "axios"
import type { ColumnsType } from "antd/es/table"

const { Search } = Input

interface Post {
  userId: number
  id: number
  title: string
  body: string
}

const fetchPosts = async (): Promise<Post[]> => {
  const { data } = await axios.get("https://jsonplaceholder.typicode.com/posts")
  return data
}

const Posts = () => {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize] = useState<number>(20)
  const [filterTitle, setFilterTitle] = useState<string>("")
  const [filterOwner, setFilterOwner] = useState<string | null>(null)
  const [localPosts, setLocalPosts] = useState<Post[]>([])
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  const [isAddingPost, setIsAddingPost] = useState<boolean>(false)
  const [newPostTitle, setNewPostTitle] = useState<string>("")
  const [newPostBody, setNewPostBody] = useState<string>("")
  const [newPostOwner, setNewPostOwner] = useState<string>("")

  const {
    data: posts,
    error,
    isLoading,
  } = useQuery({ queryKey: ["posts"], queryFn: fetchPosts })

  useEffect(() => {
    if (posts) {
      setLocalPosts(posts)
    }
  }, [posts])

  const filteredPosts = localPosts
    .filter((post) => (filterTitle ? post.title.includes(filterTitle) : true))
    .filter((post) =>
      filterOwner ? post.userId === parseInt(filterOwner) : true
    )

  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const columns: ColumnsType<Post> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      className: "w-[5%]",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      className: "w-[65%]",
    },
    {
      title: "Full Preview",
      key: "action",
      className: "w-[20%]",
      render: (text: string, post: Post) => (
        <Button
          onClick={() => {
            setSelectedPost(post)
            setIsModalVisible(true)
          }}
        >
          View
        </Button>
      ),
    },
    {
      title: "Owner",
      dataIndex: "userId",
      key: "userId",
      className: "w-[10%]",
    },
  ]

  const addNewPost = async () => {
    try {
      const newPost = {
        userId: parseInt(newPostOwner),
        id: localPosts.length + 1,
        title: newPostTitle,
        body: newPostBody,
      }

      await axios.post("https://jsonplaceholder.typicode.com/posts", newPost)
      message.success("Post added successfully")

      setLocalPosts([...localPosts, newPost])

      setNewPostTitle("")
      setNewPostBody("")
      setNewPostOwner("")

      setIsAddingPost(false)
    } catch (error) {
      console.error("Error adding new post:", error)
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <div className="flex flex-row gap-4 mb-8">
        <Search
          className="w-[200px]"
          placeholder="Filter by title"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setFilterTitle(e.target.value)
          }
        />
        <Input
          className="w-[200px]"
          placeholder="Filter by owner"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setFilterOwner(e.target.value)
          }
        />
      </div>
      <div className="mb-4 add-post-container">
        <Button onClick={() => setIsAddingPost(true)}>Add Post</Button>
      </div>
      <Table
        dataSource={paginatedPosts}
        loading={isLoading}
        rowKey="id"
        pagination={false}
        columns={columns}
      />
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={filteredPosts.length}
        onChange={(page: number) => setCurrentPage(page)}
        style={{ marginTop: "16px" }}
      />
      <Modal
        title="Post Content"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {selectedPost && (
          <div>
            <p>
              <strong>Title:</strong> {selectedPost.title}
            </p>
            <p>
              <strong>Owner:</strong> {selectedPost.userId}
            </p>
            <p>
              <strong>Body:</strong> {selectedPost.body}
            </p>
          </div>
        )}
      </Modal>
      <Modal
        title="Add New Post"
        open={isAddingPost}
        onCancel={() => {
          setIsAddingPost(false)
          setNewPostTitle("")
          setNewPostBody("")
          setNewPostOwner("")
        }}
        footer={[
          <Button key="cancel" onClick={() => setIsAddingPost(false)}>
            Cancel
          </Button>,
          <Button
            key="add"
            type="primary"
            onClick={addNewPost}
            disabled={!newPostTitle || !newPostBody || !newPostOwner}
          >
            Add
          </Button>,
        ]}
      >
        <Input
          placeholder="Title"
          value={newPostTitle}
          onChange={(e) => setNewPostTitle(e.target.value)}
          className="mb-2"
        />
        <Input
          placeholder="Body"
          value={newPostBody}
          onChange={(e) => setNewPostBody(e.target.value)}
          className="mb-2"
        />
        <Input
          placeholder="Owner"
          value={newPostOwner}
          onChange={(e) => setNewPostOwner(e.target.value)}
          className="mb-2"
        />
      </Modal>
    </div>
  )
}

export default Posts
