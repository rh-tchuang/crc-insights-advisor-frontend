/* eslint max-len: 0 */
import './_RuleDetails.scss';

import * as AppConstants from '../../AppConstants';

import { Battery, Reboot, Shield } from '@redhat-cloud-services/frontend-components';
import { Card, CardBody, Grid, GridItem, Stack, StackItem, Text, TextContent, TextVariants } from '@patternfly/react-core';
import { compact, intersection } from 'lodash';

import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import ReactMarkdown from 'react-markdown/with-html';
import barDividedList from '../../Utilities/BarDividedList';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';

const RuleDetails = ({ children, className, rule, intl, topics, header, isDetailsPage }) => {
    const ruleResolutionRisk = (rule) => {
        const resolution = rule.resolution_set.find(resolution => resolution.system_type ===
            AppConstants.SYSTEM_TYPES.rhel ||
            AppConstants.SYSTEM_TYPES.ocp);
        return resolution ? resolution.resolution_risk.risk : undefined;
    };

    const resolutionRisk = ruleResolutionRisk(rule);

    const topicLinks = () => topics && compact(topics.map((topic) =>
        intersection(topic.tag.split(' '), rule.tags.split(' ')).length &&
        <React.Fragment key={topic.slug}>
            <Link to={`/topics/${topic.slug}`}>
                {`${topic.name}`}
            </Link>
        </React.Fragment>
    ));

    return <Grid gutter='md' className={className}>
        <GridItem md={8} sm={12}>
            <Grid>
                {header && <GridItem className='pf-u-pb-md'>
                    {header}
                </GridItem>}
                <GridItem className='pf-u-pb-md'>
                    {
                        typeof rule.summary === 'string' &&
                        Boolean(rule.summary) &&
                        <ReactMarkdown source={rule.summary} escapeHtml={false} />
                    }
                </GridItem>
                {rule.node_id && (
                    <GridItem className='pf-u-pb-md'>
                        <a rel="noopener noreferrer" target="_blank" href={`https://access.redhat.com/node/${rule.node_id}`}>
                            {intl.formatMessage(messages.knowledgebaseArticle)}&nbsp;<ExternalLinkAltIcon size='sm' />
                        </a>
                    </GridItem>
                )}
                {topics && rule.tags && topicLinks().length > 0 &&
                    <GridItem>
                        <Card className="topicsCard" isCompact>
                            <CardBody>
                                <strong>{intl.formatMessage(messages.topicRelatedToRule)}</strong>
                                <br />
                                {barDividedList(topicLinks())}
                            </CardBody>
                        </Card>
                    </GridItem>
                }
                {!isDetailsPage && rule.impacted_systems_count > 0 &&
                    <GridItem className='pf-u-pb-md'>
                        <Link key={`${rule.rule_id}-link`} to={`/rules/${rule.rule_id}`}>
                            {intl.formatMessage(messages.viewAffectedSystems, { systems: rule.impacted_systems_count })}
                        </Link>
                    </GridItem>
                }
            </Grid>
        </GridItem>
        <GridItem md={4} sm={12}>
            <Grid gutter='sm'>
                {children && (
                    <GridItem>
                        {children}
                    </GridItem>
                )}
                <GridItem className='pf-u-pb-md' sm={8} md={12}>
                    <Stack>
                        <StackItem>{intl.formatMessage(messages.totalRisk)}</StackItem>
                        <StackItem className='pf-u-display-inline-flex alignCenterOverride pf-u-pb-sm pf-u-pt-sm'>
                            <span className='pf-u-display-inline-flex'>
                                <Battery
                                    label=''
                                    severity={rule.total_risk} />
                                <span className={`batteryTextMarginOverride pf-u-pl-sm ins-sev-clr-${rule.total_risk}`}>
                                    {AppConstants.TOTAL_RISK_LABEL[rule.total_risk] || intl.formatMessage(messages.undefined)}
                                </span>
                            </span>
                        </StackItem>
                        <StackItem>
                            <TextContent>
                                <Text component={TextVariants.small}>{intl.formatMessage(messages.rulesDetailsTotalriskBody, {
                                    likelihood: AppConstants.LIKELIHOOD_LABEL[rule.likelihood] || intl.formatMessage(messages.undefined),
                                    impact: AppConstants.IMPACT_LABEL[rule.impact.impact] || intl.formatMessage(messages.undefined),
                                    strong(str) { return <strong>{str}</strong>; }
                                })}</Text>
                            </TextContent>
                        </StackItem>
                        <hr></hr>
                        <StackItem>{intl.formatMessage(messages.riskofchange)}</StackItem>
                        <StackItem className='pf-u-display-inline-flex alignCenterOverride pf-u-pb-sm pf-u-pt-sm'>
                            <span className='pf-u-display-inline-flex'>
                                <Shield
                                    hasTooltip={false}
                                    impact={resolutionRisk}
                                    size={'md'}
                                    title={AppConstants.RISK_OF_CHANGE_LABEL[resolutionRisk] || intl.formatMessage(messages.undefined)} />
                                <span className={`label pf-u-pl-sm ins-sev-clr-${resolutionRisk}`}>
                                    {AppConstants.RISK_OF_CHANGE_LABEL[resolutionRisk] || intl.formatMessage(messages.undefined)}
                                </span>
                            </span>
                        </StackItem>
                        <StackItem>
                            <TextContent>
                                <Text component={TextVariants.small}>
                                    {AppConstants.RISK_OF_CHANGE_DESC[resolutionRisk]}
                                </Text>
                            </TextContent>
                        </StackItem>
                    </Stack>
                    {rule.reboot_required && <Reboot red />}
                </GridItem>
            </Grid>
        </GridItem>
    </Grid>;
};

RuleDetails.propTypes = {
    children: PropTypes.any,
    className: PropTypes.string,
    rule: PropTypes.object,
    intl: PropTypes.any,
    topics: PropTypes.array,
    header: PropTypes.any,
    isDetailsPage: PropTypes.bool
};

export default injectIntl(RuleDetails);
