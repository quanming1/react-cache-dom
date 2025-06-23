import React, { useState, useRef, useEffect } from "react";
import { CacheDom, CacheGroup, CacheGroupRef } from "react-cache-dom";

// 表单项类型定义
interface FormField {
  id: string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "checkbox" | "radio";
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string | number | boolean;
}

// 表单配置类型定义
interface FormConfig {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
}

// 表单组件的Props类型
interface FormProps {
  config: FormConfig;
  onSubmit: (values: Record<string, any>) => void;
}

/**
 * 复杂表单组件
 */
const ComplexForm: React.FC<FormProps> = ({ config, onSubmit }) => {
  console.log(`表单渲染: ${config.title}`);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 初始化表单值
  useEffect(() => {
    const initialValues: Record<string, any> = {};
    config.fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        initialValues[field.id] = field.defaultValue;
      }
    });
    setFormValues(initialValues);
  }, [config.id]);

  // 处理表单项变化
  const handleChange = (fieldId: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));

    // 清除错误
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    config.fields.forEach((field) => {
      if (field.required && (formValues[field.id] === undefined || formValues[field.id] === "")) {
        newErrors[field.id] = `${field.label}是必填项`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formValues);
    }
  };

  // 渲染表单项
  const renderField = (field: FormField) => {
    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            id={field.id}
            value={formValues[field.id] || ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`form-input ${errors[field.id] ? "error" : ""}`}
          />
        );
      case "number":
        return (
          <input
            type="number"
            id={field.id}
            value={formValues[field.id] || ""}
            onChange={(e) => handleChange(field.id, e.target.value ? Number(e.target.value) : "")}
            placeholder={field.placeholder}
            className={`form-input ${errors[field.id] ? "error" : ""}`}
          />
        );
      case "textarea":
        return (
          <textarea
            id={field.id}
            value={formValues[field.id] || ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={`form-textarea ${errors[field.id] ? "error" : ""}`}
          />
        );
      case "select":
        return (
          <select
            id={field.id}
            value={formValues[field.id] || ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={`form-select ${errors[field.id] ? "error" : ""}`}
          >
            <option value="">请选择</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case "checkbox":
        return (
          <input
            type="checkbox"
            id={field.id}
            checked={!!formValues[field.id]}
            onChange={(e) => handleChange(field.id, e.target.checked)}
            className="form-checkbox"
          />
        );
      case "radio":
        return (
          <div className="radio-group">
            {field.options?.map((option) => (
              <label key={option.value} className="radio-label">
                <input
                  type="radio"
                  name={field.id}
                  value={option.value}
                  checked={formValues[field.id] === option.value}
                  onChange={() => handleChange(field.id, option.value)}
                  className="form-radio"
                />
                {option.label}
              </label>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="complex-form"
      style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}
    >
      <h2>{config.title}</h2>
      <p>{config.description}</p>

      <form onSubmit={handleSubmit}>
        {config.fields.map((field) => (
          <div key={field.id} className="form-group" style={{ marginBottom: "15px" }}>
            <label
              htmlFor={field.id}
              style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}
            >
              {field.label} {field.required && <span style={{ color: "red" }}>*</span>}
            </label>
            {renderField(field)}
            {errors[field.id] && (
              <div className="error-message" style={{ color: "red", fontSize: "12px" }}>
                {errors[field.id]}
              </div>
            )}
          </div>
        ))}

        <div className="form-actions" style={{ marginTop: "20px" }}>
          <button
            type="submit"
            style={{
              backgroundColor: "#4caf50",
              color: "white",
              padding: "10px 15px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            提交
          </button>
        </div>
      </form>

      <div style={{ marginTop: "15px", fontSize: "12px", color: "#666" }}>
        <p>表单渲染时间: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

// 预定义的表单配置
const formConfigs: FormConfig[] = [
  {
    id: "personal-info",
    title: "个人信息表单",
    description: "请填写您的基本个人信息",
    fields: [
      {
        id: "name",
        label: "姓名",
        type: "text",
        required: true,
        placeholder: "请输入您的姓名",
      },
      {
        id: "age",
        label: "年龄",
        type: "number",
        required: true,
        placeholder: "请输入您的年龄",
      },
      {
        id: "gender",
        label: "性别",
        type: "radio",
        required: true,
        options: [
          { value: "male", label: "男" },
          { value: "female", label: "女" },
          { value: "other", label: "其他" },
        ],
      },
      {
        id: "bio",
        label: "个人简介",
        type: "textarea",
        placeholder: "请简单介绍一下自己",
      },
    ],
  },
  {
    id: "contact-info",
    title: "联系方式表单",
    description: "请填写您的联系方式信息",
    fields: [
      {
        id: "email",
        label: "电子邮箱",
        type: "text",
        required: true,
        placeholder: "请输入您的电子邮箱",
      },
      {
        id: "phone",
        label: "手机号码",
        type: "text",
        required: true,
        placeholder: "请输入您的手机号码",
      },
      {
        id: "address",
        label: "居住地址",
        type: "textarea",
        required: true,
        placeholder: "请输入您的详细地址",
      },
      {
        id: "contact-preference",
        label: "首选联系方式",
        type: "select",
        options: [
          { value: "email", label: "电子邮箱" },
          { value: "phone", label: "电话" },
          { value: "sms", label: "短信" },
        ],
      },
    ],
  },
  {
    id: "employment",
    title: "就业信息表单",
    description: "请填写您的就业相关信息",
    fields: [
      {
        id: "company",
        label: "公司名称",
        type: "text",
        required: true,
        placeholder: "请输入您的公司名称",
      },
      {
        id: "position",
        label: "职位",
        type: "text",
        required: true,
        placeholder: "请输入您的职位",
      },
      {
        id: "experience",
        label: "工作年限",
        type: "number",
        required: true,
        placeholder: "请输入您的工作年限",
      },
      {
        id: "skills",
        label: "技能描述",
        type: "textarea",
        placeholder: "请描述您的主要技能",
      },
      {
        id: "remote",
        label: "接受远程工作",
        type: "checkbox",
      },
    ],
  },
  {
    id: "education",
    title: "教育背景表单",
    description: "请填写您的教育背景信息",
    fields: [
      {
        id: "school",
        label: "学校名称",
        type: "text",
        required: true,
        placeholder: "请输入您的学校名称",
      },
      {
        id: "degree",
        label: "学位",
        type: "select",
        required: true,
        options: [
          { value: "high-school", label: "高中" },
          { value: "associate", label: "专科" },
          { value: "bachelor", label: "本科" },
          { value: "master", label: "硕士" },
          { value: "phd", label: "博士" },
        ],
      },
      {
        id: "major",
        label: "专业",
        type: "text",
        required: true,
        placeholder: "请输入您的专业",
      },
      {
        id: "graduation-year",
        label: "毕业年份",
        type: "number",
        required: true,
        placeholder: "请输入您的毕业年份",
      },
    ],
  },
];

/**
 * 复杂表单缓存演示组件
 */
const ComplexFormCacheDemo: React.FC = () => {
  const [activeFormIndex, setActiveFormIndex] = useState<number>(0);
  const [useCaching, setUseCaching] = useState<boolean>(true);
  const [submittedData, setSubmittedData] = useState<Record<string, any> | null>(null);
  const cacheGroupRef = useRef<CacheGroupRef>(null);

  // 添加状态记录缓存键
  const [cacheKeys, setCacheKeys] = useState<string[]>([]);

  // 监听缓存变化
  useEffect(() => {
    if (cacheGroupRef.current) {
      setCacheKeys(cacheGroupRef.current.getCacheKeys());
    }
  }, [activeFormIndex]);

  // 处理表单提交
  const handleFormSubmit = (values: Record<string, any>) => {
    setSubmittedData({
      formId: formConfigs[activeFormIndex].id,
      values,
      submittedAt: new Date().toLocaleString(),
    });
  };

  // 切换表单
  const switchForm = (index: number) => {
    setActiveFormIndex(index);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>复杂表单缓存演示</h1>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ marginRight: "10px" }}>
          <input type="checkbox" checked={useCaching} onChange={() => setUseCaching(!useCaching)} />
          启用表单缓存
        </label>
        <p style={{ fontSize: "14px", color: "#666" }}>
          {useCaching
            ? "已启用缓存：切换表单时会保留表单状态，避免重新渲染"
            : "已禁用缓存：每次切换表单都会重新渲染"}
        </p>
      </div>

      <div style={{ display: "flex", marginBottom: "20px" }}>
        <div style={{ flex: "0 0 200px", marginRight: "20px" }}>
          <h3>表单列表</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {formConfigs.map((config, index) => (
              <button
                key={config.id}
                onClick={() => switchForm(index)}
                style={{
                  padding: "10px",
                  backgroundColor: activeFormIndex === index ? "#4caf50" : "#f0f0f0",
                  color: activeFormIndex === index ? "white" : "black",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                {config.title}
                {cacheKeys.includes(`form-${config.id}`) && (
                  <span
                    style={{
                      marginLeft: "5px",
                      color: activeFormIndex === index ? "white" : "#4caf50",
                    }}
                  >
                    (已缓存)
                  </span>
                )}
              </button>
            ))}
          </div>

          {cacheKeys.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h4>当前缓存的表单:</h4>
              <ul style={{ paddingLeft: "20px" }}>
                {cacheKeys.map((key) => (
                  <li key={key}>{key.replace("form-", "")}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div style={{ flex: "1" }}>
          <CacheGroup ref={cacheGroupRef} groupId="forms-group" capacity={4}>
            {useCaching ? (
              <CacheDom
                key={`form-${formConfigs[activeFormIndex].id}`}
                cacheKey={`form-${formConfigs[activeFormIndex].id}`}
                Component={ComplexForm}
                props={{
                  config: formConfigs[activeFormIndex],
                  onSubmit: handleFormSubmit,
                }}
                onCacheHit={() => console.log(`表单缓存命中: ${formConfigs[activeFormIndex].id}`)}
                onCacheMiss={() =>
                  console.log(`表单缓存未命中: ${formConfigs[activeFormIndex].id}`)
                }
              />
            ) : (
              <ComplexForm config={formConfigs[activeFormIndex]} onSubmit={handleFormSubmit} />
            )}
          </CacheGroup>
        </div>
      </div>

      {submittedData && (
        <div
          style={{
            marginTop: "30px",
            padding: "15px",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
          }}
        >
          <h3>最近提交的表单数据</h3>
          <p>
            <strong>表单ID:</strong> {submittedData.formId}
          </p>
          <p>
            <strong>提交时间:</strong> {submittedData.submittedAt}
          </p>
          <div>
            <strong>表单数据:</strong>
            <pre
              style={{
                backgroundColor: "#eee",
                padding: "10px",
                borderRadius: "4px",
                overflow: "auto",
              }}
            >
              {JSON.stringify(submittedData.values, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: "30px",
          padding: "15px",
          backgroundColor: "#f0f8ff",
          borderRadius: "8px",
        }}
      >
        <ul style={{ paddingLeft: "20px" }}>
          <li>启用缓存后，切换表单再切回来，表单的输入状态会被保留</li>
          <li>禁用缓存后，每次切换表单都会重置表单状态</li>
        </ul>
      </div>
    </div>
  );
};

export default ComplexFormCacheDemo;
