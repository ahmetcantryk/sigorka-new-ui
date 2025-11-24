import React from 'react';

type BreadcrumbItem = { name: string; href?: string };
type BreadcrumbProps = { items: BreadcrumbItem[] };

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => (
  <nav aria-label="breadcrumb">
    <ol className="breadcrumb" itemScope itemType="https://schema.org/BreadcrumbList">
      {items.map((item, idx) => (
        <li
          key={item.name}
          className={`breadcrumb-item${idx === items.length - 1 ? ' active' : ''}`}
          {...(idx === items.length - 1 ? { 'aria-current': 'page' } : {})}
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
        >
          {item.href && idx !== items.length - 1 ? (
            <a href={item.href} itemProp="item">
              <span itemProp="name">{item.name}</span>
            </a>
          ) : (
            <span itemProp="name">{item.name}</span>
          )}
          <meta itemProp="position" content={String(idx + 1)} />
        </li>
      ))}
    </ol>
  </nav>
);

export default Breadcrumb; 